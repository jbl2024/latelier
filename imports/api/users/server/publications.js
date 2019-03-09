import { Meteor } from "meteor/meteor";

Meteor.publish("users", function usersPublication() {
  return Meteor.users.find(
    {},
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1
      }
    }
  );
});

Meteor.publish("user", function() {
  return Meteor.users.find(
    {
      _id: this.userId
    },
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1
      }
    }
  );
});

Meteor.publish("userEmailSettings", function() {
  return Meteor.users.find(
    {
      _id: this.userId
    },
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1,
        emailSettings: 1
      }
    }
  );
});
