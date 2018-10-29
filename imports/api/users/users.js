import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


Meteor.methods({
  'admin.findUsers'(skip) {

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    const perPage = 10;

    if (!skip) {
      skip = 0;
    }

    const count = Meteor.users.find({}).count();

    const data = Meteor.users.find(
      {},
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
    ).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    }
  }
});