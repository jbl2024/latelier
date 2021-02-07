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

Meteor.publish("tasksForList", function tasksPublication(listId, offset, labelIds) {
  check(listId, String);
  check(offset, Match.Maybe(Number));
  check(labelIds, Match.Maybe([String]));

  const skip = offset || 0;
  const query = {
    listId,
    deleted: false
  };

  if (labelIds && labelIds.length > 0) {
    query.labels = {
      $in: labelIds
    };
  }

  return Tasks.find(
    query,
    { sort: { order: 1 }, skip: skip, limit: 50 }
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
  check(taskId, Match.Maybe(String));
  if (!taskId) {
    this.ready();
    return null;
  }
  return Tasks.find({ _id: taskId, deleted: { $ne: true } });
});
