import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Projects } from "/imports/api/projects/projects.js";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import * as htmlToText from "html-to-text";
import carbone from "carbone";
import moment from "moment";

import {
  checkCanReadTask,
  checkCanReadProject,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

const bound = Meteor.bindEnvironment((callback) => callback());

Meteor.methods({
  "tasks.clone"(taskId, name, projectId, listId, keepDates) {
    check(taskId, String);
    check(name, Match.Maybe(String));
    check(projectId, Match.Maybe(String));
    check(listId, Match.Maybe(String));
    check(keepDates, Match.Maybe(Boolean));
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

    const notes = (task.notes || []).map((note) => ({
      _id: Random.id(),
      createdAt: note.createdAt,
      createdBy: note.createdBy,
      edited: note.edited,
      editedBy: note.editedBy,
      content: note.content
    }));

    const checklist = (task.checklist || []).map((aChecklist) => ({
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

Tasks.methods.exportODT = new ValidatedMethod({
  name: "tasks.export",
  validate: new SimpleSchema({
    taskId: { type: String },
    format: { type: String }
  }).validator(),
  run({ taskId, format }) {
    checkCanReadTask(taskId);

    const source = Assets.absoluteFilePath(`exports/tasks/task.${format}`);
    const task = Tasks.findOne({ _id: taskId });
    const context = Tasks.helpers.loadAssociations(task);

    context.description = htmlToText.fromString(context.description);
    if (context.notes) {
      context.notes.forEach((note) => {
        note.content = htmlToText.fromString(note.content);
        note.createdAt = moment(note.createdAt).format("DD/MM/YYYY HH:mm");
      });
    }

    context.startDate = context.startDate ? moment(context.startDate).format("DD/MM/YYYY HH:mm") : "";
    context.dueDate = context.dueDate ? moment(context.dueDate).format("DD/MM/YYYY HH:mm") : "";
    context.completedAt = context.completedAt ? moment(context.completedAt).format("DD/MM/YYYY HH:mm") : "";

    const future = new (Npm.require(
      Npm.require("path").join("fibers", "future")
    ))();

    bound(() => {
      carbone.render(source, context, (err, res) => {
        if (err) {
          throw new Meteor.Error("error", err);
        }
        future.return({
          data: res
        });
      });
    });
    return future.wait();
  }
});


Tasks.methods.exportProject = new ValidatedMethod({
  name: "tasks.exportProject",
  validate: new SimpleSchema({
    projectId: { type: String },
    format: { type: String }
  }).validator(),
  run({ projectId, format }) {
    checkCanReadProject(projectId);

    const source = Assets.absoluteFilePath(`exports/tasks/tasks.${format}`);
    const project = Projects.findOne({ _id: projectId });
    const context = project;
    context.lists = [];

    const lists = Lists.find({ projectId: projectId }, { sort: { order: 1 } });
    lists.forEach((list) => {
      context.lists.push(list);
      list.tasks = [];
      const tasks = Tasks.find({
        listId: list._id,
        deleted: { $ne: true }
      }, { sort: { order: 1 } });

      tasks.forEach((task) => {
        task = Tasks.helpers.loadAssociations(task);
        task.description = htmlToText.fromString(task.description);
        if (task.notes) {
          task.notes.forEach((note) => {
            note.content = htmlToText.fromString(note.content);
            note.createdAt = moment(note.createdAt).format("DD/MM/YYYY HH:mm");
          });
        }

        if (task.labels) {
          let labels = "";
          task.labels.forEach((label) => {
            if (labels === "") {
              labels = `${label.name}`;
            } else {
              labels = `${labels} / ${label.name}`;
            }
          });
          task.labels = labels;
        }

        if (task.assignedTo && task.assignedTo.emails) {
          task.assignedTo = task.assignedTo.emails[0].address;
        } else {
          task.assignedTo = "";
        }

        task.startDate = task.startDate ? moment(task.startDate).format("DD/MM/YYYY HH:mm") : "";
        task.dueDate = task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY HH:mm") : "";
        task.completedAt = task.completedAt ? moment(task.completedAt).format("DD/MM/YYYY HH:mm") : "";

        list.tasks.push(task);
      });
    });

    const future = new (Npm.require(
      Npm.require("path").join("fibers", "future")
    ))();

    bound(() => {
      carbone.render(source, context, (err, res) => {
        if (err) {
          throw new Meteor.Error("error", err);
        }
        future.return({
          data: res
        });
      });
    });
    return future.wait();
  }
});
