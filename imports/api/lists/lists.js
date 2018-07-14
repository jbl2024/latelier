import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Lists = new Mongo.Collection('lists');

Meteor.methods({
  'lists.insert'(projectId, name) {
    check(projectId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var list = Lists.insert({
      name,
      projectId: projectId,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return list;
  },

  'lists.remove'(listId) {
    check(listId, String);

    Lists.remove(listId);
  },
});