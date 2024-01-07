import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import {
  Permissions,
  checkLoggedIn
} from "/imports/api/permissions/permissions";
import { Email } from "/imports/email";
import { UserUtils } from "/imports/api/users/utils";
import * as htmlToText from "html-to-text";
import { MJML } from "/imports/mjml";

// Disable client insert/remove/update
Meteor.users.deny({
  insert() {
    return true;
  },
  remove() {
    return true;
  },
  update() {
    return true;
  }
});

Meteor.methods({
  async "admin.findUsers"(page, filter, isOnline, isAway) {
    check(page, Number);
    check(filter, Match.Maybe(String));
    check(isOnline, Match.Maybe(Boolean));
    check(isAway, Match.Maybe(Boolean));

    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    let query = {};
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: "i" }
        }
      };

      query = {
        $or: [
          { emails },
          {
            "profile.email": { $regex: `.*${filter}.*`, $options: "i" }
          },
          {
            "profile.firstName": { $regex: `.*${filter}.*`, $options: "i" }
          },
          {
            "profile.lastName": { $regex: `.*${filter}.*`, $options: "i" }
          }
        ]
      };
    }
    if (isOnline) {
      if (!query.$or) query = { $or: [] };
      query.$or.push({ statusConnection: "online" });
    }
    if (isAway) {
      if (!query.$or) query = { $or: [] };
      query.$or.push({ statusConnection: "away" });
    }

    const count = await Meteor.users.find(query).countAsync();

    const data = await Meteor.users
      .find(query, {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1,
          roles: 1
        },
        skip,
        limit: perPage,
        sort: {
          _id: 1
        }
      });

    const dataWithFeatures = [];
    data.forEachAsync(async (user) => {
      const userWithFeatures = {
        ...user,
        features: {
          emailVerified: user.emails ? user.emails[0].verified : false,
          isActive: await Permissions.isActive(user),
          isAdmin: await Permissions.isAdmin(user)
        }
      };
      dataWithFeatures.push(userWithFeatures);
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: dataWithFeatures
    };
  },

  async "admin.updateUser"(user) {
    check(user, Object);

    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const { _id } = user;
    await Meteor.users.updateAsync(
      {
        _id
      },
      {
        $set: {
          profile: user.profile,
          emails: user.emails
        }
      }
    );

    const features = user.features || {};
    if (user._id !== Meteor.userId()) {
      if (features.isActive && !Permissions.isActive(user)) {
        await Meteor.callAsync("admin.activateUser", user._id);
      } else if (!features.isActive && Permissions.isActive(user)) {
        await Meteor.callAsync("admin.deactivateUser", user._id);
      }
      if (features.emailVerified && !user.emails[0].verified) {
        await Meteor.callAsync("admin.confirmEmail", user._id);
      } else if (!features.emailVerified && user.emails[0].verified) {
        await Meteor.callAsync("admin.unconfirmEmail", user._id);
      }
      if (features.isAdmin && !await Permissions.isAdmin(user)) {
        Permissions.setAdmin(user._id);
      } else if (!features.isAdmin && Permissions.isAdmin(user)) {
        await Permissions.removeAdmin(user._id);
        await Meteor.users.updateAsync(user._id, {
          $set: {
            "services.resume.loginTokens": []
          }
        });
      }
    }

    if (user.password && user.password.length > 0) {
      if (user.password === user.passwordConfirmation && user.password.length > 2) {
        Accounts.setPassword(_id, user.password);
      } else {
        throw new Meteor.Error(400, "wrong-password");
      }
    }
  },

  async "admin.deactivateUser"(userId) {
    check(userId, String);
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Permissions.setInactive(userId);
  },

  async "admin.activateUser"(userId) {
    check(userId, String);
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Permissions.setActive(userId);
  },

  async "admin.removeUser"(userId) {
    check(userId, String);
    if (userId === Meteor.userId()) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    await Meteor.users.updateAsync(userId, {
      $set: {
        "services.resume.loginTokens": []
      }
    });
    await Meteor.users.removeAsync(userId);
  },

  async "admin.confirmEmail"(userId) {
    check(userId, String);
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    await Meteor.users.updateAsync(
      { _id: userId },
      {
        $set: {
          "services.email.verificationTokens": [],
          "emails.0.verified": true
        }
      }
    );
  },

  async "admin.unconfirmEmail"(userId) {
    check(userId, String);
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    await Meteor.users.updateAsync(
      { _id: userId },
      {
        $set: {
          "emails.0.verified": false
        }
      }
    );
  },

  async "admin.addUser"(user) {
    check(user, Object);
    if (!await Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const existingUser = await Meteor.users.findOneAsync({
      emails: {
        $elemMatch: {
          address: { $regex: user.email, $options: "i" }
        }
      }
    });
    if (existingUser) {
      throw new Meteor.Error(401, "email-exists");
    }

    const userData = {
      createdAt: new Date(),
      email: user.email,
      profile: user.profile
    };
    const userId = Accounts.createUser(userData);
    if (user.isConfirmed) {
      await Meteor.callAsync("admin.confirmEmail", userId);
    } else {
      await Meteor.callAsync("admin.unconfirmEmail", userId);
    }
    if (user.isActive) {
      await Meteor.callAsync("admin.activateUser", userId);
    } else {
      await Meteor.callAsync("admin.deactivateUser", userId);
    }
    return userId;
  },

  async "users.create"(userData) {
    check(userData, Object);
    if (Meteor.settings.disableAccountCreation) {
      throw new Meteor.Error("not-authorized");
    }
    const userId = Accounts.createUser(userData);
    if (Meteor.settings.public.emailVerificationNeeded) {
      Accounts.sendVerificationEmail(userId);
    }
  },

  async "users.getEmailPreferences"() {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    const user = await Meteor.users.findOneAsync({ _id: Meteor.userId() });
    user.emailSettings = user.emailSettings || {};
    user.emailSettings.tasks = user.emailSettings.tasks || {
      assignTo: true,
      update: true
    };
    user.emailSettings.digests = user.emailSettings.digests || {
      daily: true
    };
    return user;
  },

  async "users.updateEmailPreferences"(settings) {
    check(settings, Object);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await Meteor.users.updateAsync(
      {
        _id: Meteor.userId()
      },
      {
        $set: {
          emailSettings: settings
        }
      }
    );
  },

  async "users.findUsers"(page, filter) {
    check(page, Number);
    check(filter, Match.Maybe(String));
    checkLoggedIn();

    let restriction = "all";
    if (
      Meteor.settings
      && Meteor.settings.users
      && Meteor.settings.users.search
    ) {
      restriction = Meteor.settings.users.search;
    }

    if (restriction === "admin") {
      if (!await Permissions.isAdmin(Meteor.userId())) {
        throw new Meteor.Error(401, "not-authorized");
      }
    }

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    let query = {};
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: "i" }
        }
      };

      query = {
        $or: [
          { emails },
          {
            "profile.email": { $regex: `.*${filter}.*`, $options: "i" }
          },
          {
            "profile.firstName": { $regex: `.*${filter}.*`, $options: "i" }
          },
          {
            "profile.lastName": { $regex: `.*${filter}.*`, $options: "i" }
          }
        ]
      };
    }

    const count = await Meteor.users.find(query).countAsync();

    const data = await Meteor.users
      .find(query, {
        fields: {
          profile: 1,
          emails: 1
        },
        skip,
        limit: perPage,
        sort: {
          _id: 1
        }
      })
      .fetchAsync();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  },

  async "users.invite"(email) {
    check(email, String);
    checkLoggedIn();

    let restriction = "all";
    if (
      Meteor.settings
      && Meteor.settings.users
      && Meteor.settings.users.invite
    ) {
      restriction = Meteor.settings.users.invite;
    }

    if (restriction === "admin") {
      if (!await Permissions.isAdmin(Meteor.userId())) {
        throw new Meteor.Error(401, "not-authorized");
      }
    }

    const userData = {
      profile: {
        firstName: "",
        lastName: ""
      },
      email
    };

    const existingUser = await Meteor.users.findOneAsync({
      emails: {
        $elemMatch: {
          address: { $regex: userData.email, $options: "i" }
        }
      }
    });
    if (existingUser) {
      throw new Meteor.Error(401, "email-exists");
    }

    const userId = Accounts.createUser({
      createdAt: new Date(),
      email: userData.email,
      profile: userData.profile
    });
    await Meteor.users.updateAsync(
      { _id: userId },
      {
        $set: {
          "services.email.verificationTokens": [],
          "emails.0.verified": true
        }
      }
    );

    const user = await Meteor.users.findOneAsync({ _id: userId });
    await Meteor.callAsync("users.sendInvitation", user);
    return user;
  },

  async "users.sendInvitation"(user) {
    check(user, Object);
    this.unblock();

    const emailData = {
      subject() {
        return "Invitation à collaborer sur L'atelier";
      },
      html() {
        const email = new MJML(Assets.absoluteFilePath("mjml/invitation.mjml"));
        email.helpers({
          url: Meteor.absoluteUrl(),
          emailSettingsUrl: Meteor.absoluteUrl("/settings/mail")
        });
        return email.compile();
      }
    };
    const html = emailData.html();
    const text = htmlToText.fromString(html, {
      tables: true
    });
    try {
      Email.send({
        to: UserUtils.getEmail(user),
        subject: emailData.subject(),
        text,
        html
      });
    } catch (error) {
      /* eslint no-console:off */
      console.error(error);
    }
  },

  async "users.getProfile"() {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    const options = {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1
      }
    };

    const user = await Meteor.users.findOneAsync({ _id: Meteor.userId() }, options);
    if (!user.profile) {
      user.profile = {};
    }
    return user;
  },

  /**
   * This is useful to force log out from
   * oauth2 id provider for example
   */
  async "users.getRedirectUrlAfterLogout"() {
    const user = await Meteor.user();
    if (!user) {
      return Meteor.absoluteUrl("/");
    }
    // Oauth enabled
    if (user.services?.oidc) {
      const redirectUrl = Meteor.absoluteUrl("/login");
      const redirectParameter = Meteor.settings.auth?.oauth2?.logoutRedirectParameter;
      const baseUrl = Meteor.settings.auth?.oauth2.serverUrl;
      let logoutUrl = Meteor.settings.auth?.oauth2?.logoutUrl;
      if (!logoutUrl || !baseUrl) {
        return null;
      }
      if (redirectParameter) {
        if (logoutUrl.indexOf("?") === -1) {
          logoutUrl = `${logoutUrl}?${redirectParameter}=${redirectUrl}`;
        }
      }
      return `${baseUrl}${logoutUrl}`;
      // SSO enabled
    } if (Boolean(Meteor?.settings?.public?.sso?.enabled)
      && Meteor?.settings?.public?.sso?.logoutUrl) {
      return Meteor.settings.public.sso.logoutUrl;
      // Default logout
    }
    return null;
  },

  async "users.oauthEnabled"() {
    return {
      enabled: Meteor.settings.auth?.oauth2?.enabled,
      title: Meteor.settings.auth?.oauth2?.title
    };
  }
});
