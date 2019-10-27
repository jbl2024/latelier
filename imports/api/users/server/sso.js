import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Accounts.registerLoginHandler(() => {});

Meteor.methods({
  "users.ssoAuthenticate"() {
    const email = headers.get(this, Meteor.settings.public.sso.email);
    if (!email) {
      throw new Meteor.Error("no-email");
    }

    let user = Accounts.findUserByEmail(email);
    if (!user) {
      const userData = {
        createdAt: new Date(),
        email
      };
      const userId = Accounts.createUser(userData);
      Meteor.users.update(
        { _id: userId },
        {
          $set: {
            "services.email.verificationTokens": [],
            "emails.0.verified": true
          }
        }
      );
      user = Accounts.findUserByEmail(email);
    }

    // Create hashed token so user stays logged in
    const stampedToken = Accounts._generateStampedLoginToken();
    const hashStampedToken = Accounts._hashStampedToken(stampedToken);
    // Update the user's token in mongo
    Meteor.users.update(user._id, {
      $push: {
        "services.resume.loginTokens": hashStampedToken
      }
    });
    return stampedToken;
  }
});
