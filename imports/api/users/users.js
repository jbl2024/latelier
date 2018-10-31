import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Permissions } from '/imports/api/users/permissions'
import { removeAllListeners } from "cluster";

Meteor.methods({
  "admin.findUsers"(page, filter) {
    
    if (!Permissions.isAdmin(Meteor.userId())) {
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
    let query = {}
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: ".*" + filter + ".*", $options: "i" }
        }
      }     

      query = {
        $or: [
          {emails: emails},
          {"profile.firstName": { $regex: ".*" + filter + ".*", $options: "i" }},
          {"profile.lastName": { $regex: ".*" + filter + ".*", $options: "i" }}
        ]
      }
    }

    const count = Meteor.users.find(query).count();

    const data = Meteor.users
      .find(
        query,
        {
          fields: {
            profile: 1,
            status: 1,
            statusDefault: 1,
            statusConnection: 1,
            emails: 1,
            roles: 1
          },
          skip: skip,
          limit: perPage,
          sort: {
            _id: 1
          }
        }
      )
      .fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  },

  "admin.updateUser"(user) {
    check(user, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const _id = user._id;
    delete user._id;
    Meteor.users.update(
      {
        _id: _id
      },
      {
        $set: {
          profile: user.profile,
          emails: user.emails
        }
      }
    );
  },

  "admin.deactivateUser"(userId) {
    check(userId, String);
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Permissions.setInactive(userId)
  },

  "admin.activateUser"(userId) {
    check(userId, String);
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Permissions.setActive(userId)
  },

  "admin.removeUser" (userId) {
    check(userId, String);
    if (userId == Meteor.userId()) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Meteor.users.update(userId, {
      $set: {
          "services.resume.loginTokens": []
      }
    });
    Meteor.users.remove(userId);
  }
});
