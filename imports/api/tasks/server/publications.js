import { Meteor } from 'meteor/meteor';
import { Tasks } from '../tasks';

// This code only runs on the server
Meteor.publish('tasks', function tasksPublication(listId) {
  return Tasks.find({ listId: listId });
});

Meteor.publish('task', function task(taskId) {
  return Tasks.find({ _id: taskId });
});
