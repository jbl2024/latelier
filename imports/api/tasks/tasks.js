import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Lists } from '/imports/api/lists/lists.js'

export const Tasks = new Mongo.Collection('tasks');

Meteor.methods({
  'tasks.insert'(projectId, listId, name) {
    check(projectId, String);
    check(listId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    var taskId = Tasks.insert({
      name,
      projectId: projectId,
      listId: listId,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return Tasks.findOne({_id: taskId});
  },

  'tasks.remove'(taskId) {
    check(taskId, String);

    Tasks.remove(taskId);
  },

  'tasks.updateName'(taskId, name) {
    check(taskId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Tasks.update({_id: taskId}, {$set: {name: name}});
  },
});