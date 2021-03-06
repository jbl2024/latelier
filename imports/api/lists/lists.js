import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { Tasks } from "/imports/api/tasks/tasks.js";
import ListSchema from "./schema";
import { Permissions, checkCanWriteProject } from "/imports/api/permissions/permissions";

export const Lists = new Mongo.Collection("lists");
Lists.attachSchema(ListSchema);

if (Meteor.isServer) {
  Meteor.startup(() => {
    Lists.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  "lists.insert"(projectId, name, autoComplete, catchCompleted, listUserId) {
    check(projectId, String);
    check(name, String);
    check(autoComplete, Match.Maybe(Boolean));
    check(catchCompleted, Match.Maybe(Boolean));
    check(listUserId, Match.Maybe(String));

    if (!autoComplete) autoComplete = false;
    if (!catchCompleted) catchCompleted = false;

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    checkCanWriteProject(projectId);

    let userId = Meteor.userId();
    const canSelectUserId = listUserId && Meteor.isServer && Permissions.isAdmin(userId);
    userId = canSelectUserId ? listUserId : userId;

    const _findLastOrder = function() {
      const list = Lists.findOne({ projectId }, { sort: { order: -1 } });
      if (list) {
        return list.order;
      }
      return 0;
    };

    const listId = Lists.insert({
      name,
      order: _findLastOrder() + 1,
      autoComplete,
      catchCompleted,
      projectId,
      createdAt: new Date(),
      createdBy: userId
    });

    return Lists.findOne({ _id: listId });
  },

  "lists.remove"(listId) {
    check(listId, String);
    const list = Lists.findOne({ _id: listId });
    checkCanWriteProject(list.projectId);

    const tasks = Tasks.find({ listId });
    tasks.forEach((task) => {
      Tasks.update({ _id: task._id }, { $set: { listId: null } });
      Meteor.call("tasks.remove", task._id);
    });

    Lists.remove(listId);
  },

  "lists.updateName"(listId, name) {
    check(listId, String);
    check(name, String);

    const list = Lists.findOne({ _id: listId });
    checkCanWriteProject(list.projectId);

    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    Lists.update({ _id: listId }, { $set: { name } });
  },

  "lists.move"(projectId, listId, order) {
    check(projectId, String);
    check(listId, String);
    check(order, Number);

    checkCanWriteProject(projectId);

    const _reorder = function() {
      const lists = Lists.find({ projectId }, { sort: { order: 1 } }).fetch();
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        list.order = i * 10;
        Lists.update({ _id: list._id }, { $set: { order: list.order } });
      }
    };

    Lists.update(
      { _id: listId },
      { $set: { order } },
      {},
      () => {
        _reorder();
      }
    );
  },

  "lists.autoComplete"(listId, autoComplete) {
    check(listId, String);
    check(autoComplete, Boolean);

    const list = Lists.findOne({ _id: listId });
    checkCanWriteProject(list.projectId);

    Lists.update({ _id: listId }, { $set: { autoComplete } });
    if (autoComplete) {
      Tasks.update({ listId }, { $set: { completed: true } }, { multi: true });
    }
  },

  "lists.catchCompleted"(listId, catchCompleted) {
    check(listId, String);
    check(catchCompleted, Boolean);

    const list = Lists.findOne({ _id: listId });
    checkCanWriteProject(list.projectId);

    Lists.update({ _id: listId }, { $set: { catchCompleted } });
    if (catchCompleted) {
      Lists.update(
        {
          projectId: list.projectId,
          _id: { $ne: listId },
          catchCompleted: true
        },
        { $set: { catchCompleted: false } },
        { multi: true }
      );

      Meteor.call("lists.findTasksToCatch", list.projectId);
    }
  },

  "lists.findTasksToCatch"(projectId) {
    check(projectId, String);
    const list = Lists.findOne({ projectId, catchCompleted: true });
    if (!list) {
      return;
    }

    const tasks = Tasks.find({
      projectId,
      listId: { $ne: list._id },
      completed: true
    });
    tasks.forEach((task) => {
      Meteor.call("tasks.move", projectId, list._id, task._id, /* move task to top */ -1);
    });
  }
});
