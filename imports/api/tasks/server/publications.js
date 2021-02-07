import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Tasks } from "../tasks";

// This code only runs on the server
Meteor.publish("tasksForProject", function tasksPublication(projectId) {
  check(projectId, String);
  return Tasks.find(
    { projectId, deleted: { $ne: true } },
    { sort: { order: 1 } }
  );
});

Meteor.publish("tasksForList", function tasksPublication(listId) {
  check(listId, String);
  return Tasks.find(
    { listId, deleted: { $ne: true } },
    { sort: { order: 1 }, limit: 5000 }
  );
});

Meteor.publish("tasksByIds", function tasksPublication(ids) {
  check(ids, Match.Maybe([String]));
  if (!ids) {
    this.ready();
    return null;
  }
  return Tasks.find(
    { _id: { $in: ids }, deleted: { $ne: true } },
    { sort: { order: 1 } }
  );
});

Meteor.publish("task", function task(taskId) {
  check(taskId, String);
  return Tasks.find({ _id: taskId, deleted: { $ne: true } });
});
