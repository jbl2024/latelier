import { Meteor } from 'meteor/meteor';

// This code only runs on the server
Meteor.publish('users', function usersPublication() {
  return Meteor.users.find({}, { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 } });
});

