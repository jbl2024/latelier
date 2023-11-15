import carbone from "carbone";
import * as htmlToText from "html-to-text";
import { check, Match } from "meteor/check";
import { Log } from "meteor/logging";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Labels } from "/imports/api/labels/labels.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

import {
  checkCanReadProject,
  checkCanReadTask,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

Meteor.methods({
  async "tasks.clone"(taskId, name, projectId, listId, keepDates) {
    check(taskId, String);
    check(name, Match.Maybe(String));
    check(projectId, Match.Maybe(String));
    check(listId, Match.Maybe(String));
    check(keepDates, Match.Maybe(Boolean));
    await checkCanReadTask(taskId);

    const userId = Meteor.userId();
    const now = new Date();

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    if (!name) name = task.name;
    if (!projectId) projectId = task.projectId;

    await checkCanWriteProject(projectId);

    const cloneToAnotherProject = task.projectId !== projectId;

    if (cloneToAnotherProject && !listId) {
      const list = await Lists.findOneAsync({ projectId });
      if (list) {
        listId = list._id;
      } else {
        listId = Meteor.callAsync("lists.insert", projectId, "Sans nom")._id;
      }
    }

    if (!listId) listId = task.listId;

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

    const findLabelsInDestinationProject = async () => {
      const labels = [];
      if (!task.labels) {
        return labels;
      }
      task.labels.forEach(async (labelId) => {
        const previousLabel = await Labels.findOneAsync({
          _id: labelId
        });
        const labelInClonedProject = await Labels.findOneAsync({
          name: previousLabel.name,
          color: previousLabel.color,
          projectId: projectId
        });
        if (labelInClonedProject) {
          labels.push(labelInClonedProject._id);
        }
      });
      return labels;
    };

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
      labels: !cloneToAnotherProject ? task.labels : await findLabelsInDestinationProject(),
      watchers: !cloneToAnotherProject ? task.watchers : undefined,
      notes,
      checklist,
      startDate: task.startDate,
      dueDate: task.dueDate
    };

    const clonedTaskId = await Tasks.insertAsync(clonedTask);
    Meteor.callAsync("tasks.setNumber", clonedTaskId);

    const _reorder = async function (aListId) {
      const tasks = await Tasks.find({ aListId }, { sort: { order: 1 } }).fetchAsync();
      for (let i = 0; i < tasks.length; i++) {
        const aTask = tasks[i];
        aTask.order = i * 10;

        // eslint-disable-next-line no-await-in-loop
        await Tasks.direct.updateAsync({ _id: aTask._id }, { $set: { order: aTask.order } });
      }
    };
    _reorder(clonedTask.listId);

    const attachments = await Attachments.find({ "meta.taskId": taskId });
    await attachments.forEachAsync(async (attachment) => {
      await Meteor.callAsync("attachments.clone", {
        attachmentId: attachment._id,
        taskId: clonedTaskId,
        projectId
      });
    });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.create",
      taskId: clonedTaskId
    });
    return Tasks.findOneAsync({ _id: clonedTaskId });
  },

  async "tasks.track"(event) {
    check(event, {
      taskId: String,
      type: String,
      properties: Match.Optional(Object)
    });
    const userId = Meteor.userId();

    Meteor.defer(async () => {
      const task = await Tasks.findOneAsync({ _id: event.taskId });
      const properties = event.properties || {};

      const project = await Projects.findOneAsync({ _id: task.projectId });
      const list = await Lists.findOneAsync({ _id: task.listId });

      properties.task = task;
      properties.task.project = project;
      properties.task.list = list;
      properties.task.url = Meteor.absoluteUrl(
        `/projects/${project._id}/${task._id}`
      );

      await Meteor.callAsync("events.track", {
        type: event.type,
        userId: userId,
        properties
      });

      await Meteor.callAsync("digests.add", {
        type: event.type,
        properties: properties
      });
    });
  },

  async "tasks.getUrl"(taskNumber) {
    check(taskNumber, Number);
    const task = await Tasks.findOneAsync({ number: taskNumber });
    if (!task) {
      throw new Meteor.Error("not-found");
    }
    await checkCanReadTask(task._id);

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
  run: async function({ taskId, format }) {
    await checkCanReadTask(taskId);

    const source = Assets.absoluteFilePath(`exports/tasks/task.${format}`);
    const task = await Tasks.findOneAsync({ _id: taskId });
    const context = await Tasks.helpers.loadAssociations(task);

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

    try {
      // Wrap carbone.render in a Promise
      const result = await new Promise((resolve, reject) => {
        carbone.render(source, context, (err, res) => {
          if (err) {
            reject(new Meteor.Error("error", err));
          } else {
            resolve({ data: res });
          }
        });
      });
      return result;
    } catch (error) {
      // Handle the error appropriately
      Log.error(error);
      throw error;
    }
  }
});

Tasks.methods.exportProject = new ValidatedMethod({
  name: "tasks.exportProject",
  validate: new SimpleSchema({
    projectId: { type: String },
    format: {
      type: String,
      optional: true
    }
  }).validator(),
  async run({ projectId, format }) {
    checkCanReadProject(projectId);
    const project = Projects.findOne({ _id: projectId });
    const context = project;
    context.lists = [];

    const lists = Lists.find({ projectId: projectId }, { sort: { order: 1 } });
    await lists.forEachAsync(async (list) => {
      context.lists.push(list);
      list.tasks = [];
      const tasks = Tasks.find({
        listId: list._id,
        deleted: { $ne: true }
      }, { sort: { order: 1 } });

      await tasks.forEachAsync(async (task) => {
        if (format) {
          task = await Tasks.helpers.loadAssociations(task);
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
        }
        list.tasks.push(task);
      });
    });

    if (!format) {
      return context;
    }

    const result = await new Promise((resolve, reject) => {
      const source = Assets.absoluteFilePath(`exports/tasks/tasks.${format}`);
      carbone.render(source, context, (err, res) => {
        if (err) {
          reject(new Meteor.Error("error", err));
        }
        resolve({
          data: res
        });
      });
    });
    return result;
  }
});
