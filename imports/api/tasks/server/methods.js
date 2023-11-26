import carbone from "carbone";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Events } from "/imports/api/events/events.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Meetings } from "/imports/api/meetings/meetings.js";
import { Projects } from "/imports/api/projects/projects.js";

import { Random } from "meteor/random";
import SimpleSchema from "simpl-schema";
import { incrementCounter } from "./counter";
import {
  checkCanDeleteTask,
  checkCanReadProject,
  checkCanReadTask,
  checkCanWriteProject,
  checkCanWriteTask,
  Permissions
} from "/imports/api/permissions/permissions";
import { UserUtils } from "/imports/api/users/utils";

import * as htmlToText from "html-to-text";
import { Log } from "meteor/logging";
import moment from "moment";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Labels } from "/imports/api/labels/labels.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

const incNumber = async function() {
  return incrementCounter("taskNumber");
};

const removeLinkWithMeetingAction = async (taskId) => {
  const meeting = await Meetings.findOneAsync({
    "actions.taskId": taskId
  });
  if (!meeting || !meeting.actions || !Array.isArray(meeting.actions) || !meeting.actions.length) {
    return;
  }
  linkedAction = meeting.actions.find((action) => action.taskId === taskId);
  if (!linkedAction) {
    return;
  }
  linkedAction.taskId = null;
  await Meteor.callAsync("meetings.updateAction", {
    meetingId: meeting._id,
    action: linkedAction
  });
};

const _checkForCompletion = function(listId, taskId) {
  const list = Lists.findOne({ _id: listId });
  if (list && list.autoComplete) {
    Tasks.update({ _id: taskId }, { $set: { completed: true } });
  }
};

Tasks.before.update(function(userId, doc, fieldNames, modifier) {
  const hasCompletedModification = () => {
    if (modifier.$set && modifier.$set.completed !== undefined) {
      return true;
    }
    return false;
  };

  modifier.$set = modifier.$set || {};
  modifier.$set.updatedAt = new Date();
  modifier.$set.updatedBy = userId;
  if (hasCompletedModification()) {
    // if completed flag is set, set the "completedAt" attribute
    if (modifier.$set.completed) {
      modifier.$set.completedAt = modifier.$set.updatedAt;
    } else {
      modifier.$set.completedAt = null; // reset date attribute
    }
  }
});

if (Meteor.isServer) {
  Meteor.methods({
    async "tasks.insert"(
      projectId,
      listId,
      name,
      labelIds,
      assignedTo,
      dueDate,
      startDate,
      description,
      watchers,
      notes,
      checklist,
      reminderStartDate,
      reminderDueDate,
      estimation,
      taskUserId,
      disableTracking
    ) {
      check(projectId, String);
      check(listId, String);
      check(name, String);
      check(labelIds, Match.Maybe([String]));
      check(assignedTo, Match.Maybe(String));
      check(dueDate, Match.Maybe(String));
      check(startDate, Match.Maybe(String));
      check(description, Match.Maybe(String));
      check(watchers, Match.Maybe([String]));
      check(reminderStartDate, Match.Maybe(Number));
      check(reminderDueDate, Match.Maybe(Number));
      check(estimation, Match.Maybe({
        size: Match.OneOf(String, Number),
        spent: Match.OneOf(String, Number)
      }));
      check(disableTracking, Match.Maybe(Boolean));

      // Task notes
      check(notes, Match.Where((taskNotes) => {
        if (!Array.isArray(taskNotes) || !taskNotes.length) return true;
        taskNotes.forEach((note) => {
          check(note, {
            _id: String,
            createdAt: Match.Maybe(String),
            createdBy: String,
            content: String,
            edited: Match.Maybe(Boolean),
            editedBy: Match.Maybe(String)
          });
        });
        return true;
      }));

      // Checklist items
      check(checklist, Match.Where((checklistItems) => {
        if (!Array.isArray(checklistItems) || !checklistItems.length) return true;
        checklistItems.forEach((listItem) => {
          check(listItem, {
            _id: String,
            createdAt: Match.Maybe(String),
            createdBy: String,
            name: String,
            checked: Match.Maybe(Boolean)
          });
        });
        return true;
      }));

      check(taskUserId, Match.Maybe(String));
      checkCanWriteProject(projectId);

      let userId = Meteor.userId();
      const canSelectUserId = taskUserId && Meteor.isServer && Permissions.isAdmin(userId);
      userId = canSelectUserId ? taskUserId : userId;

      if (!userId) {
        throw new Meteor.Error("not-authorized");
      }

      const _findFirstOrder = function() {
        const task = Tasks.findOne(
          { projectId, listId },
          { sort: { order: 1 }, fields: { order: 1 } }
        );
        if (task) {
          return task.order;
        }
        return 0;
      };
      const now = new Date();

      let completed = false;
      let completedAt;
      const list = Lists.findOne({ _id: listId });
      if (list && list.autoComplete) {
        completed = true;
        completedAt = now;
      }
      let number;
      if (Meteor.isServer) {
        number = await incNumber();
      }

      if (Array.isArray(notes) && notes.length) {
        notes.forEach((note) => {
          if (note.createdAt) {
            note.createdAt = new Date(note.createdAt);
          }
        });
      }

      const taskId = Tasks.insert({
        name,
        description,
        order: _findFirstOrder() - 10,
        projectId,
        listId,
        completed,
        completedAt,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        watchers: watchers || [userId],
        number,
        assignedTo,
        dueDate,
        startDate,
        labels: labelIds || [],
        notes: notes || [],
        checklist: checklist || [],
        reminderStartDate,
        reminderDueDate,
        estimation
      });

      if (!disableTracking) {
        await Meteor.callAsync("tasks.track", {
          type: "tasks.create",
          taskId
        });
      }
      return Tasks.findOne({ _id: taskId });
    }
  });
}

Meteor.methods({
  async "tasks.setNumber"(taskId) {
    check(taskId, String);
    const number = incNumber();
    await Tasks.direct.updateAsync({ _id: taskId }, { $set: { number } });
  },

  async "tasks.remove"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);

    await Tasks.updateAsync(
      { _id: taskId },
      {
        $set: {
          deleted: true,
          deletedBy: Meteor.userId(),
          deletedAt: new Date()
        }
      }
    );

    await removeLinkWithMeetingAction(taskId);

    await Meteor.callAsync("tasks.track", {
      type: "tasks.remove",
      taskId
    });
  },

  async "tasks.deleteForever"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);

    await Meteor.callAsync("attachments.remove", { taskId });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.deleteForever",
      taskId
    });

    await Tasks.removeAsync(taskId);
    await removeLinkWithMeetingAction(taskId);
  },

  async "tasks.restore"(taskId) {
    check(taskId, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }
    let { listId } = task;
    if (!listId) {
      const list = await Lists.findOneAsync({ projectId: task.projectId });
      if (list) {
        listId = list._id;
      } else {
        listId = await Meteor.callAsync("lists.insert", task.projectId, "Sans nom")._id;
      }
    }
    await Tasks.updateAsync(
      { _id: taskId },
      {
        $set: {
          deleted: false,
          listId
        }
      }
    );

    await Meteor.callAsync("attachments.restore", { taskId });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.restore",
      taskId
    });
  },

  async "tasks.updateName"(taskId, name) {
    check(taskId, String);
    check(name, String);
    await checkCanWriteTask(taskId);
    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    await Tasks.updateAsync({ _id: taskId }, { $set: { name } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.updateName",
      taskId
    });
  },

  async "tasks.updateDescription"(taskId, description) {
    check(taskId, String);
    check(description, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (task.description && task.description === description) {
      return;
    }

    await Tasks.updateAsync({ _id: taskId }, { $set: { description } });

    Meteor.callAsync("tasks.track", {
      type: "tasks.updateDescription",
      taskId
    });
  },

  async "tasks.updateSize"(taskId, size) {
    check(taskId, String);
    check(size, Match.Maybe(String));
    await checkCanWriteTask(taskId);
    await Tasks.updateAsync({ _id: taskId }, { $set: { "estimation.size": size } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.updateEstimation.size",
      taskId
    });
  },

  async "tasks.updateSpent"(taskId, spent) {
    check(taskId, String);
    check(spent, Match.Maybe(String));
    await checkCanWriteTask(taskId);
    await Tasks.updateAsync({ _id: taskId }, { $set: { "estimation.spent": spent } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.updateEstimation.spent",
      taskId
    });
  },

  async "tasks.complete"(taskId, completed) {
    check(taskId, String);
    check(completed, Boolean);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync({ _id: taskId }, { $set: { completed } });
    const task = Tasks.findOne({ _id: taskId });
    await Meteor.callAsync("lists.findTasksToCatch", task.projectId);

    await Meteor.callAsync("tasks.track", {
      type: completed ? "tasks.complete" : "tasks.uncomplete",
      taskId
    });
  },

  async "tasks.move"(projectId, listId, taskId, order) {
    check(projectId, String);
    check(listId, String);
    check(taskId, String);
    check(order, Match.Maybe(Number));
    await checkCanWriteTask(taskId);

    _checkForCompletion(listId, taskId);

    const _reorder = async function() {
      const tasks = await Tasks.find(
        { listId },
        { sort: { order: 1 } }
      ).fetchAsync();
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        task.order = i * 10;

        // eslint-disable-next-line no-await-in-loop
        await Tasks.direct.updateAsync({ _id: task._id }, { $set: { order: task.order } });
      }
    };
    if (order) {
      await Tasks.direct.updateAsync(
        { _id: taskId },
        { $set: { listId, order } },
        {},
        () => {
          _reorder();
        }
      );
    } else {
      const lastTask = await Tasks.findOneAsync(
        { projectId, listId },
        { sort: { order: -1 } }
      );
      if (lastTask) {
        order = lastTask.order + 10;
      } else {
        order = 10;
      }
      await Tasks.direct.updateAsync(
        { _id: taskId },
        { $set: { listId, order } },
        {}
      );
    }

    await Meteor.callAsync("tasks.track", {
      type: "tasks.move",
      taskId
    });
  },

  async "tasks.addNote"(taskId, content) {
    check(taskId, String);
    check(content, String);
    await checkCanWriteTask(taskId);

    const note = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      content
    };

    await Tasks.updateAsync({ _id: taskId }, { $push: { notes: note } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.addNote",
      taskId
    });
  },

  async "tasks.removeNote"(taskId, noteId) {
    check(taskId, String);
    check(noteId, Match.Maybe(String));
    await checkCanWriteTask(taskId);

    if (noteId) {
      await Tasks.updateAsync({ _id: taskId }, { $pull: { notes: { _id: noteId } } });
    } else {
      await Tasks.updateAsync({ _id: taskId }, { $set: { notes: [] } });
    }

    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeNote",
      taskId
    });
  },

  async "tasks.updateNote"(taskId, note) {
    check(taskId, String);
    check(note, Object);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync(
      {
        _id: taskId,
        "notes._id": note._id
      },
      {
        $set: {
          "notes.$.content": note.content,
          "notes.$.edited": true,
          "notes.$.editedBy": Meteor.userId()
        }
      }
    );

    await Meteor.callAsync("tasks.track", {
      type: "tasks.updateNote",
      taskId
    });
  },

  async "tasks.addChecklistItem"(taskId, name) {
    check(taskId, String);
    check(name, String);
    await checkCanWriteTask(taskId);

    const item = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      name,
      checked: false
    };

    await Tasks.updateAsync({ _id: taskId }, { $push: { checklist: item } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.addChecklistItem",
      taskId
    });

    return item._id;
  },

  async "tasks.removeChecklistItem"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync({ _id: taskId }, { $pull: { checklist: { _id: itemId } } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeChecklistItem",
      taskId
    });
  },

  async "tasks.toggleCheckItem"(taskId, itemId, checked) {
    check(taskId, String);
    check(itemId, String);
    check(checked, Boolean);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync(
      { _id: taskId, "checklist._id": itemId },
      { $set: { "checklist.$.checked": checked } }
    );

    await Meteor.callAsync("tasks.track", {
      type: "tasks.toggleCheckItem",
      taskId
    });
  },

  async "tasks.convertItemToTask"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId, "checklist._id": itemId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const item = task.checklist.find((aItem) => aItem._id === itemId);

    await Meteor.callAsync("tasks.track", {
      type: "tasks.convertItemToTask",
      taskId,
      properties: {
        item
      }
    });

    const convertedTask = await Meteor.callAsync("tasks.insert", task.projectId, task.listId, item.name, task.labels);
    await Meteor.callAsync("tasks.removeChecklistItem", taskId, itemId);

    return convertedTask;
  },

  async "tasks.updateCheckListItem"(taskId, item) {
    check(taskId, String);
    check(item, Object);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const itemIndex = task.checklist.findIndex((aItem) => aItem._id === item._id);
    task.checklist[itemIndex] = item;
    await Tasks.updateAsync({ _id: taskId }, { $set: { checklist: task.checklist } });
  },

  async "tasks.updateCheckList"(taskId, checklist) {
    check(taskId, String);
    check(checklist, Array);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    await Tasks.updateAsync({ _id: taskId }, { $set: { checklist } });
  },

  async "tasks.assignTo"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) throw new Meteor.Error("task-not-found");
    if (task.assignedTo === userId) return;

    const previousAssignee = task.assignedTo;
    if (previousAssignee) {
      await Meteor.callAsync("tasks.addWatcher", taskId, previousAssignee);
    }

    await Tasks.updateAsync({ _id: taskId }, { $set: { assignedTo: userId } });

    await Meteor.callAsync("tasks.removeWatcher", taskId, userId);

    await Meteor.callAsync("tasks.track", {
      type: "tasks.assignTo",
      taskId
    });

    if (Meteor.isServer) {
      if (await Projects.find({ _id: task.projectId, members: userId }).countAsync() > 0) {
        return;
      }
      await Meteor.callAsync("projects.addMember", {
        projectId: task.projectId,
        userId
      });
    }
  },

  async "tasks.removeAssignedTo"(taskId) {
    check(taskId, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) throw new Meteor.Error("task-not-found");
    const assignee = task.assignedTo;
    if (!assignee) return;
    await Meteor.callAsync("tasks.addWatcher", taskId, assignee);

    await Tasks.updateAsync({ _id: taskId }, { $set: { assignedTo: null } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeAssignedTo",
      taskId
    });
  },

  async "tasks.addWatcher"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    await checkCanWriteTask(taskId);

    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const watchers = task.watchers || [];
    const alreadyWatching = watchers.find((w) => w === userId);
    if (alreadyWatching) return;

    await Tasks.updateAsync({ _id: taskId }, { $push: { watchers: userId } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.addWatcher",
      taskId
    });

    if (Meteor.isServer) {
      if (await Projects.find({ _id: task.projectId, members: userId }).countAsync() > 0) {
        return;
      }
      await Meteor.callAsync("projects.addMember", {
        projectId: task.projectId,
        userId
      });
    }
  },

  async "tasks.removeWatcher"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    await checkCanWriteTask(taskId);

    if (await Tasks.find({ _id: taskId, watchers: userId }).countAsync() === 0) {
      return;
    }
    await Tasks.updateAsync({ _id: taskId }, { $pull: { watchers: userId } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeWatcher",
      taskId
    });
  },

  async "tasks.setDueDate"(taskId, dueDate, reminder) {
    check(taskId, String);
    check(dueDate, Match.Maybe(String));
    check(reminder, Match.Maybe(Match.OneOf(String, Number)));
    await checkCanWriteTask(taskId);

    if (reminder === "never") reminder = null;

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    await Tasks.updateAsync(
      { _id: taskId },
      { $set: { dueDate: dueDate || null, reminderDueDate: reminder } }
    );

    await Meteor.callAsync("tasks.track", {
      type: "tasks.setDueDate",
      taskId
    });
  },

  async "tasks.setStartDate"(taskId, startDate, reminder) {
    check(taskId, String);
    check(startDate, Match.Maybe(String));
    check(reminder, Match.Maybe(Match.OneOf(String, Number)));
    await checkCanWriteTask(taskId);

    if (reminder === "never") reminder = null;

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await Tasks.updateAsync(
      { _id: taskId },
      { $set: { startDate: startDate || null, reminderStartDate: reminder } }
    );

    await Meteor.callAsync("tasks.track", {
      type: "tasks.setStartDate",
      taskId
    });
  },

  async "tasks.addLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);
    await checkCanWriteTask(taskId);

    if (await Tasks.find({ _id: taskId, labels: labelId }).countAsync() > 0) {
      return;
    }
    await Tasks.updateAsync({ _id: taskId }, { $push: { labels: labelId } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.addLabel",
      taskId
    });
  },

  async "tasks.removeLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);
    await checkCanWriteTask(taskId);

    if (await Tasks.find({ _id: taskId, labels: labelId }).countAsync() === 0) {
      return;
    }
    await Tasks.updateAsync({ _id: taskId }, { $pull: { labels: labelId } });

    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeLabel",
      taskId
    });
  },

  async "tasks.addAttachment"(taskId) {
    check(taskId, String);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync(
      { _id: taskId },
      { $set: { updatedAt: new Date(), updatedBy: Meteor.userId() } }
    );

    await Meteor.callAsync("tasks.track", {
      type: "tasks.addAttachment",
      taskId
    });
  },

  async "tasks.removeAttachment"(taskId, attachmentId) {
    check(taskId, String);
    check(attachmentId, String);
    await checkCanWriteTask(taskId);

    await Tasks.updateAsync(
      { _id: taskId },
      { $set: { updatedAt: new Date(), updatedBy: Meteor.userId() } }
    );

    await Meteor.callAsync("attachments.remove", { attachmentId });
    await Meteor.callAsync("tasks.track", {
      type: "tasks.removeAttachment",
      taskId
    });
  }
});

Tasks.methods.getHistory = new ValidatedMethod({
  name: "tasks.getHistory",
  validate: new SimpleSchema({
    taskId: { type: String },
    page: { type: Number }
  }).validator(),
  async run({ taskId, page }) {
    await checkCanReadTask(taskId);
    const query = {
      "properties.task._id": taskId
    };

    const perPage = 4;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = await Events.find(query).countAsync();
    const data = Events.find(query, {
      skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    });

    const dataWithUsers = [];
    await data.forEachAsync(async (item) => {
      item.user = item.userId;
      const user = await Meteor.users.findOneAsync({ _id: item.userId });
      if (user) {
        item.user = UserUtils.getEmail(user);
      }
      dataWithUsers.push(item);
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: dataWithUsers
    };
  }
});

Tasks.methods.moveToAdjacentList = new ValidatedMethod({
  name: "tasks.moveToAdjacentList",
  validate: new SimpleSchema({
    taskId: { type: String },
    direction: { type: String }
  }).validator(),
  async run({ taskId, direction }) {
    await checkCanWriteTask(taskId);
    const task = await Tasks.findOneAsync({ _id: taskId });
    const list = await Lists.findOneAsync({ _id: task.listId });
    let newList;
    let { order } = list;
    if (direction === "left") {
      order -= 1;
      newList = Lists.findOne({
        projectId: task.projectId,
        order: {
          $lte: order
        }
      }, {
        sort: {
          order: -1
        }
      });
    } else if (direction === "right") {
      order += 1;
      newList = await Lists.findOneAsync({
        projectId: task.projectId,
        order: {
          $gte: order
        }
      }, {
        sort: {
          order: 1
        }
      });
    }

    if (!newList || newList._id === list._id) {
      return;
    }
    await Meteor.callAsync("tasks.move", task.projectId, newList._id, taskId);
  }
});

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

    const attachments = Attachments.find({ "meta.taskId": taskId });
    attachments.forEach(async (attachment) => {
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
