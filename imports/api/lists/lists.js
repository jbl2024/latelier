import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Tasks } from '/imports/api/tasks/tasks.js'

export const Lists = new Mongo.Collection('lists');

Meteor.methods({
  'lists.insert'(projectId, name) {
    check(projectId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var _findLastOrder = function () {
      var list = Lists.findOne({projectId: projectId}, {sort: {order: -1}});
      if (list) {
        return list.order;
      }
      return 0;
    }

    var listId = Lists.insert({
      name,
      order: _findLastOrder() + 1,
      projectId: projectId,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return Lists.findOne({_id: listId});
  },

  'lists.remove'(listId) {
    check(listId, String);

    Lists.remove(listId);
    Tasks.remove({listId: listId});
  },

  'lists.updateName'(listId, name) {
    check(listId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Lists.update({_id: listId}, {$set: {name: name}});
  },
});