import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Events } from "/imports/api/events/events.js";
import { Meetings } from "/imports/api/meetings/meetings.js";

import { Random } from "meteor/random";
import {
  Permissions,
  checkCanReadTask,
  checkCanWriteTask,
  checkCanDeleteTask,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";
import { UserUtils } from "/imports/api/users/utils";
import SimpleSchema from "simpl-schema";
import { incrementCounter } from "./counter";
import TaskSchema from "./schema";

export const Tasks = new Mongo.Collection("tasks");
Tasks.attachSchema(TaskSchema);
Tasks.methods = {};
Tasks.helpers = {};

const incNumber = function() {
  return incrementCounter("taskNumber");
};

const removeLinkWithMeetingAction = (taskId) => {
  const meeting = Meetings.findOne({
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
  Meteor.call("meetings.updateAction", {
    meetingId: meeting._id,
    action: linkedAction
  });
};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Tasks.rawCollection().createIndex({ listId: 1 });
    Tasks.rawCollection().createIndex({ projectId: 1 });
    Tasks.rawCollection().createIndex({ deleted: 1 });
    Tasks.rawCollection().createIndex({ projectId: 1, deleted: 1 });
    Tasks.rawCollection().createIndex({ completed: 1 });
    Tasks.rawCollection().createIndex({ completedAt: 1 });
    Tasks.rawCollection().createIndex({ projectId: 1, listId: 1, order: 1 });
    Tasks.rawCollection().createIndex({ number: 1 }, { unique: true });
  });
}

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
    "tasks.insert"(
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
        number = incNumber();
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
        Meteor.call("tasks.track", {
          type: "tasks.create",
          taskId
        });
      }
      return Tasks.findOne({ _id: taskId });
    }
  });
}

Meteor.methods({
  "tasks.setNumber"(taskId) {
    check(taskId, String);
    const number = incNumber();
    Tasks.direct.update({ _id: taskId }, { $set: { number } });
  },

  "tasks.remove"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);

    if (Meteor.isClient) {
      Tasks.remove(taskId);
      return;
    }

    Tasks.update(
      { _id: taskId },
      {
        $set: {
          deleted: true,
          deletedBy: Meteor.userId(),
          deletedAt: new Date()
        }
      }
    );

    removeLinkWithMeetingAction(taskId);

    Meteor.call("tasks.track", {
      type: "tasks.remove",
      taskId
    });
  },

  "tasks.deleteForever"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);

    Meteor.call("attachments.remove", { taskId });

    Meteor.call("tasks.track", {
      type: "tasks.deleteForever",
      taskId
    });

    Tasks.remove(taskId);
    removeLinkWithMeetingAction(taskId);
  },

  "tasks.restore"(taskId) {
    check(taskId, String);
    checkCanWriteTask(taskId);

    if (Meteor.isClient) {
      return;
    }

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }
    let { listId } = task;
    if (!listId) {
      const list = Lists.findOne({ projectId: task.projectId });
      if (list) {
        listId = list._id;
      } else {
        listId = Meteor.call("lists.insert", task.projectId, "Sans nom")._id;
      }
    }
    Tasks.update(
      { _id: taskId },
      {
        $set: {
          deleted: false,
          listId
        }
      }
    );

    Meteor.call("attachments.restore", { taskId });

    Meteor.call("tasks.track", {
      type: "tasks.restore",
      taskId
    });
  },

  "tasks.updateName"(taskId, name) {
    check(taskId, String);
    check(name, String);
    checkCanWriteTask(taskId);
    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    Tasks.update({ _id: taskId }, { $set: { name } });

    Meteor.call("tasks.track", {
      type: "tasks.updateName",
      taskId
    });
  },

  "tasks.updateDescription"(taskId, description) {
    check(taskId, String);
    check(description, String);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (task.description && task.description === description) {
      return;
    }

    Tasks.update({ _id: taskId }, { $set: { description } });

    Meteor.call("tasks.track", {
      type: "tasks.updateDescription",
      taskId
    });
  },

  "tasks.updateSize"(taskId, size) {
    check(taskId, String);
    check(size, Match.Maybe(String));
    checkCanWriteTask(taskId);
    Tasks.update({ _id: taskId }, { $set: { "estimation.size": size } });

    Meteor.call("tasks.track", {
      type: "tasks.updateEstimation.size",
      taskId
    });
  },

  "tasks.updateSpent"(taskId, spent) {
    check(taskId, String);
    check(spent, Match.Maybe(String));
    checkCanWriteTask(taskId);
    Tasks.update({ _id: taskId }, { $set: { "estimation.spent": spent } });

    Meteor.call("tasks.track", {
      type: "tasks.updateEstimation.spent",
      taskId
    });
  },

  "tasks.complete"(taskId, completed) {
    check(taskId, String);
    check(completed, Boolean);
    checkCanWriteTask(taskId);

    Tasks.update({ _id: taskId }, { $set: { completed } });
    const task = Tasks.findOne({ _id: taskId });
    Meteor.call("lists.findTasksToCatch", task.projectId);

    Meteor.call("tasks.track", {
      type: completed ? "tasks.complete" : "tasks.uncomplete",
      taskId
    });
  },

  "tasks.move"(projectId, listId, taskId, order) {
    check(projectId, String);
    check(listId, String);
    check(taskId, String);
    check(order, Match.Maybe(Number));
    checkCanWriteTask(taskId);

    _checkForCompletion(listId, taskId);

    const _reorder = function() {
      const tasks = Tasks.find(
        { listId },
        { sort: { order: 1 } }
      ).fetch();
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        task.order = i * 10;

        Tasks.direct.update({ _id: task._id }, { $set: { order: task.order } });
      }
    };
    if (order) {
      Tasks.direct.update(
        { _id: taskId },
        { $set: { listId, order } },
        {},
        () => {
          _reorder();
        }
      );
    } else {
      const lastTask = Tasks.findOne(
        { projectId, listId },
        { sort: { order: -1 } }
      );
      if (lastTask) {
        order = lastTask.order + 10;
      } else {
        order = 10;
      }
      Tasks.direct.update(
        { _id: taskId },
        { $set: { listId, order } },
        {}
      );
    }

    Meteor.call("tasks.track", {
      type: "tasks.move",
      taskId
    });
  },

  "tasks.addNote"(taskId, content) {
    check(taskId, String);
    check(content, String);
    checkCanWriteTask(taskId);

    const note = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      content
    };

    Tasks.update({ _id: taskId }, { $push: { notes: note } });

    Meteor.call("tasks.track", {
      type: "tasks.addNote",
      taskId
    });
  },

  "tasks.removeNote"(taskId, noteId) {
    check(taskId, String);
    check(noteId, Match.Maybe(String));
    checkCanWriteTask(taskId);

    if (noteId) {
      Tasks.update({ _id: taskId }, { $pull: { notes: { _id: noteId } } });
    } else {
      Tasks.update({ _id: taskId }, { $set: { notes: [] } });
    }

    Meteor.call("tasks.track", {
      type: "tasks.removeNote",
      taskId
    });
  },

  "tasks.updateNote"(taskId, note) {
    check(taskId, String);
    check(note, Object);
    checkCanWriteTask(taskId);

    Tasks.update(
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

    Meteor.call("tasks.track", {
      type: "tasks.updateNote",
      taskId
    });
  },

  "tasks.addChecklistItem"(taskId, name) {
    check(taskId, String);
    check(name, String);
    checkCanWriteTask(taskId);

    const item = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      name,
      checked: false
    };

    Tasks.update({ _id: taskId }, { $push: { checklist: item } });

    Meteor.call("tasks.track", {
      type: "tasks.addChecklistItem",
      taskId
    });

    return item._id;
  },

  "tasks.removeChecklistItem"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);
    checkCanWriteTask(taskId);

    Tasks.update({ _id: taskId }, { $pull: { checklist: { _id: itemId } } });

    Meteor.call("tasks.track", {
      type: "tasks.removeChecklistItem",
      taskId
    });
  },

  "tasks.toggleCheckItem"(taskId, itemId, checked) {
    check(taskId, String);
    check(itemId, String);
    check(checked, Boolean);
    checkCanWriteTask(taskId);

    Tasks.update(
      { _id: taskId, "checklist._id": itemId },
      { $set: { "checklist.$.checked": checked } }
    );

    Meteor.call("tasks.track", {
      type: "tasks.toggleCheckItem",
      taskId
    });
  },

  "tasks.convertItemToTask"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId, "checklist._id": itemId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const item = task.checklist.find((aItem) => aItem._id === itemId);

    Meteor.call("tasks.track", {
      type: "tasks.convertItemToTask",
      taskId,
      properties: {
        item
      }
    });

    const convertedTask = Meteor.call("tasks.insert", task.projectId, task.listId, item.name, task.labels);
    Meteor.call("tasks.removeChecklistItem", taskId, itemId);

    return convertedTask;
  },

  "tasks.updateCheckListItem"(taskId, item) {
    check(taskId, String);
    check(item, Object);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const itemIndex = task.checklist.findIndex((aItem) => aItem._id === item._id);
    task.checklist[itemIndex] = item;
    Tasks.update({ _id: taskId }, { $set: { checklist: task.checklist } });
  },

  "tasks.updateCheckList"(taskId, checklist) {
    check(taskId, String);
    check(checklist, Array);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    Tasks.update({ _id: taskId }, { $set: { checklist } });
  },

  "tasks.assignTo"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (!task) throw new Meteor.Error("task-not-found");
    if (task.assignedTo === userId) return;

    const previousAssignee = task.assignedTo;
    if (previousAssignee) {
      Meteor.call("tasks.addWatcher", taskId, previousAssignee);
    }

    Tasks.update({ _id: taskId }, { $set: { assignedTo: userId } });

    Meteor.call("tasks.removeWatcher", taskId, userId);

    Meteor.call("tasks.track", {
      type: "tasks.assignTo",
      taskId
    });

    if (Meteor.isServer) {
      if (Projects.find({ _id: task.projectId, members: userId }).count() > 0) {
        return;
      }
      Meteor.call("projects.addMember", {
        projectId: task.projectId,
        userId
      });
    }
  },

  "tasks.removeAssignedTo"(taskId) {
    check(taskId, String);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (!task) throw new Meteor.Error("task-not-found");
    const assignee = task.assignedTo;
    if (!assignee) return;
    Meteor.call("tasks.addWatcher", taskId, assignee);

    Tasks.update({ _id: taskId }, { $set: { assignedTo: null } });

    Meteor.call("tasks.track", {
      type: "tasks.removeAssignedTo",
      taskId
    });
  },

  "tasks.addWatcher"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    checkCanWriteTask(taskId);

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const watchers = task.watchers || [];
    const alreadyWatching = watchers.find((w) => w === userId);
    if (alreadyWatching) return;

    Tasks.update({ _id: taskId }, { $push: { watchers: userId } });

    Meteor.call("tasks.track", {
      type: "tasks.addWatcher",
      taskId
    });

    if (Meteor.isServer) {
      if (Projects.find({ _id: task.projectId, members: userId }).count() > 0) {
        return;
      }
      Meteor.call("projects.addMember", {
        projectId: task.projectId,
        userId
      });
    }
  },

  "tasks.removeWatcher"(taskId, userId) {
    check(taskId, String);
    check(userId, String);
    checkCanWriteTask(taskId);

    if (Tasks.find({ _id: taskId, watchers: userId }).count() === 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { watchers: userId } });

    Meteor.call("tasks.track", {
      type: "tasks.removeWatcher",
      taskId
    });
  },

  "tasks.setDueDate"(taskId, dueDate, reminder) {
    check(taskId, String);
    check(dueDate, Match.Maybe(String));
    check(reminder, Match.Maybe(Match.OneOf(String, Number)));
    checkCanWriteTask(taskId);

    if (reminder === "never") reminder = null;

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(
      { _id: taskId },
      { $set: { dueDate: dueDate || null, reminderDueDate: reminder } }
    );

    Meteor.call("tasks.track", {
      type: "tasks.setDueDate",
      taskId
    });
  },

  "tasks.setStartDate"(taskId, startDate, reminder) {
    check(taskId, String);
    check(startDate, Match.Maybe(String));
    check(reminder, Match.Maybe(Match.OneOf(String, Number)));
    checkCanWriteTask(taskId);

    if (reminder === "never") reminder = null;

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(
      { _id: taskId },
      { $set: { startDate: startDate || null, reminderStartDate: reminder } }
    );

    Meteor.call("tasks.track", {
      type: "tasks.setStartDate",
      taskId
    });
  },

  "tasks.addLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);
    checkCanWriteTask(taskId);

    if (Tasks.find({ _id: taskId, labels: labelId }).count() > 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $push: { labels: labelId } });

    Meteor.call("tasks.track", {
      type: "tasks.addLabel",
      taskId
    });
  },

  "tasks.removeLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);
    checkCanWriteTask(taskId);

    if (Tasks.find({ _id: taskId, labels: labelId }).count() === 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { labels: labelId } });

    Meteor.call("tasks.track", {
      type: "tasks.removeLabel",
      taskId
    });
  },

  "tasks.addAttachment"(taskId) {
    check(taskId, String);
    checkCanWriteTask(taskId);

    if (Meteor.isClient) {
      return;
    }
    Tasks.update(
      { _id: taskId },
      { $set: { updatedAt: new Date(), updatedBy: Meteor.userId() } }
    );

    Meteor.call("tasks.track", {
      type: "tasks.addAttachment",
      taskId
    });
  },

  "tasks.removeAttachment"(taskId, attachmentId) {
    check(taskId, String);
    check(attachmentId, String);
    checkCanWriteTask(taskId);

    if (Meteor.isClient) {
      return;
    }
    Tasks.update(
      { _id: taskId },
      { $set: { updatedAt: new Date(), updatedBy: Meteor.userId() } }
    );

    Meteor.call("attachments.remove", { attachmentId });
    Meteor.call("tasks.track", {
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
  run({ taskId, page }) {
    checkCanReadTask(taskId);
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

    const count = Events.find(query).count();
    const data = Events.find(query, {
      skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetch();

    const dataWithUsers = [];
    data.forEach((item) => {
      item.user = item.userId;
      const user = Meteor.users.findOne({ _id: item.userId });
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
  run({ taskId, direction }) {
    checkCanWriteTask(taskId);
    const task = Tasks.findOne({ _id: taskId });
    const list = Lists.findOne({ _id: task.listId });
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
      newList = Lists.findOne({
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
    Meteor.call("tasks.move", task.projectId, newList._id, taskId);
  }
});
