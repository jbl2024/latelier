import { Meteor } from 'meteor/meteor';
import { Tasks } from '../tasks';

// This code only runs on the server
Meteor.publish('tasks', function tasksPublication(listId) {
  return Tasks.find({ listId: listId, deleted: {$ne: true} }, {sort: {order: 1}});
});

Meteor.publish('task', function task(taskId) {
  return Tasks.find({ _id: taskId, deleted: {$ne: true} });
});
