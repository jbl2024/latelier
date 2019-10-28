import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Projects } from "/imports/api/projects/projects.js";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

import {
  checkLoggedIn,
  checkCanReadTask,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

Meteor.methods({
  "tasks.clone"(taskId, name, projectId, listId, keepDates) {
    check(taskId, String);
    check(name, Match.Maybe(String));
    check(projectId, Match.Maybe(String));
    check(listId, Match.Maybe(String));
    check(keepDates, Match.Maybe(Boolean));

    checkLoggedIn();
    checkCanReadTask(taskId);

    const userId = Meteor.userId();
    const now = new Date();

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    if (!name) name = task.name;
    if (!projectId) projectId = task.projectId;
    if (!listId) listId = task.listId;

    checkCanWriteProject(projectId);

    const cloneToAnotherProject = task.projectId !== projectId;
    if (cloneToAnotherProject) {
      const list = Lists.findOne({ projectId });
      if (list) {
        listId = list._id;
      } else {
        listId = Meteor.call("lists.insert", projectId, "Sans nom")._id;
      }
    }

    const notes = (task.notes || []).forEach((note) => ({
      _id: Random.id(),
      createdAt: note.createdAt,
      createdBy: note.createdBy,
      edited: note.edited,
      editedBy: note.editedBy,
      content: note.content
    }));

    const checklist = (task.checklist || []).forEach((aChecklist) => ({
      _id: Random.id(),
      createdAt: now,
      createdBy: aChecklist.createdBy,
      name: aChecklist.name,
      checked: aChecklist.checked
    }));

    const clonedTask = {
      projectId,
      listId,
      name: task.name,
      description: task.description,
      order: task.order - 1,
      completed: task.completed,
      assignedTo: !cloneToAnotherProject ? task.assignedTo : undefined,
      createdAt: !keepDates ? now : task.createdAt,
      updatedAt: !keepDates ? now : task.updatedAt,
      createdBy: !keepDates ? userId : task.createdBy,
      updatedBy: !keepDates ? userId : task.updatedBy,
      labels: !cloneToAnotherProject ? task.labels : undefined,
      watchers: !cloneToAnotherProject ? task.watchers : undefined,
      notes,
      checklist,
      startDate: task.startDate,
      dueDate: task.dueDate
    };

    const clonedTaskId = Tasks.insert(clonedTask);
    Meteor.call("tasks.setNumber", clonedTaskId);

    const _reorder = function(aListId) {
      const tasks = Tasks.find({ aListId }, { sort: { order: 1 } }).fetch();
      for (let i = 0; i < tasks.length; i++) {
        const aTask = tasks[i];
        aTask.order = i * 10;

        Tasks.direct.update({ _id: aTask._id }, { $set: { order: aTask.order } });
      }
    };
    _reorder(clonedTask.listId);

    const attachments = Attachments.find({ "meta.taskId": taskId }).fetch();
    attachments.forEach((attachment) => {
      Meteor.call("attachments.clone", {
        attachmentId: attachment._id,
        taskId: clonedTaskId,
        projectId
      });
    });

    Meteor.call("tasks.track", {
      type: "tasks.create",
      taskId: clonedTaskId
    });
    return Tasks.findOne({ _id: clonedTaskId });
  },

  "tasks.track"(event) {
    this.unblock();

    check(event, {
      taskId: String,
      type: String,
      properties: Match.Optional(Object)
    });

    const task = Tasks.findOne({ _id: event.taskId });
    const properties = event.properties || {};

    const project = Projects.findOne({ _id: task.projectId });
    const list = Lists.findOne({ _id: task.listId });

    properties.task = task;
    properties.task.project = project;
    properties.task.list = list;
    properties.task.url = Meteor.absoluteUrl(
      `/projects/${project._id}/${task._id}`
    );

    Meteor.call("events.track", {
      type: event.type,
      properties
    });
  },

  "tasks.getUrl"(taskNumber) {
    check(taskNumber, Number);
    checkLoggedIn();
    const task = Tasks.findOne({ number: taskNumber });
    if (!task) {
      throw new Meteor.Error("not-found");
    }
    checkCanReadTask(task._id);

    return {
      projectId: task.projectId,
      taskId: task._id
    };
  }
});