import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Tasks } from "../tasks";

// This code only runs on the server
Meteor.publish("tasks", function tasksPublication(listId) {
  check(listId, String);
  return Tasks.find(
    { listId, deleted: { $ne: true } },
    { sort: { order: 1 } }
  );
});

Meteor.publish("task", function task(taskId) {
  check(taskId, String);
  return Tasks.find({ _id: taskId, deleted: { $ne: true } });
});
