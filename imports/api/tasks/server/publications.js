import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { publishComposite } from "meteor/reywood:publish-composite";
import {
  checkCanReadTask
} from "/imports/api/permissions/permissions";

import { Tasks } from "../tasks";
import { Attachments } from "../../attachments/attachments";
import { Labels } from "../../labels/labels";

// This code only runs on the server
Meteor.publish("tasks", function tasksPublication(listId) {
  check(listId, String);
  return Tasks.find(
    { listId, deleted: { $ne: true } },
    { sort: { order: 1 } }
  );
});

publishComposite("task", function (taskId) {
  return {
    find() {
      try {
        check(taskId, String);
        checkCanReadTask(taskId);
      } catch (error) {
        return this.ready();
      }
      return Tasks.find({ _id: taskId, deleted: { $ne: true } });
    },
    children: [
      {
        // attachments
        find(task) {
          return Attachments.find({ "meta.taskId": task._id }).cursor;
        }
      },
      {
        // labels
        find(task) {
          return Labels.find({ projectId: task.projectId });
        }
      }
    ]
  };
});
