import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import ListSchema from "./schema";
import { checkCanWriteProject, Permissions } from "/imports/api/permissions/permissions";
import { Tasks } from "/imports/api/tasks/tasks.js";

export const Lists = new Mongo.Collection("lists");
Lists.attachSchema(ListSchema);

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await Lists.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  async "lists.insert"(projectId, name, autoComplete, catchCompleted, listUserId) {
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

    const _findLastOrder = async function() {
      const list = await Lists.findOneAsync({ projectId }, { sort: { order: -1 } });
      if (list) {
        return list.order;
      }
      return 0;
    };

    const listId = await Lists.insertAsync({
      name,
      order: _findLastOrder() + 1,
      autoComplete,
      catchCompleted,
      projectId,
      createdAt: new Date(),
      createdBy: userId
    });

    return Lists.findOneAsync({ _id: listId });
  },

  async "lists.remove"(listId) {
    check(listId, String);
    const list = await Lists.findOneAsync({ _id: listId });
    checkCanWriteProject(list.projectId);

    const tasks = Tasks.find({ listId });
    await tasks.forEachAsync(async (task) => {
      await Tasks.updateAsync({ _id: task._id }, { $set: { listId: null } });
      await Meteor.callAsync("tasks.remove", task._id);
    });

    await Lists.removeAsync(listId);
  },

  async "lists.updateName"(listId, name) {
    check(listId, String);
    check(name, String);

    const list = await Lists.findOneAsync({ _id: listId });
    checkCanWriteProject(list.projectId);

    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    await Lists.updateAsync({ _id: listId }, { $set: { name } });
  },

  async "lists.move"(projectId, listId, order) {
    check(projectId, String);
    check(listId, String);
    check(order, Number);

    checkCanWriteProject(projectId);

    const _reorder = async function() {
      const lists = await Lists.findAsync({ projectId }, { sort: { order: 1 } }).fetch();
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        list.order = i * 10;
        // eslint-disable-next-line no-await-in-loop
        await Lists.updateAsync({ _id: list._id }, { $set: { order: list.order } });
      }
    };

    await Lists.updateAsync(
      { _id: listId },
      { $set: { order } },
      {},
      () => {
        _reorder();
      }
    );
  },

  async "lists.autoComplete"(listId, autoComplete) {
    check(listId, String);
    check(autoComplete, Boolean);

    const list = await Lists.findOneAsync({ _id: listId });
    checkCanWriteProject(list.projectId);

    await Lists.updateAsync({ _id: listId }, { $set: { autoComplete } });
    if (autoComplete) {
      await Tasks.updateAsync({ listId }, { $set: { completed: true } }, { multi: true });
    }
  },

  async "lists.catchCompleted"(listId, catchCompleted) {
    check(listId, String);
    check(catchCompleted, Boolean);

    const list = await Lists.findOneAsync({ _id: listId });
    checkCanWriteProject(list.projectId);

    await Lists.updateAsync({ _id: listId }, { $set: { catchCompleted } });
    if (catchCompleted) {
      await Lists.updateAsync(
        {
          projectId: list.projectId,
          _id: { $ne: listId },
          catchCompleted: true
        },
        { $set: { catchCompleted: false } },
        { multi: true }
      );

      await Meteor.callAsync("lists.findTasksToCatch", list.projectId);
    }
  },

  async "lists.findTasksToCatch"(projectId) {
    check(projectId, String);
    const list = await Lists.findOneAsync({ projectId, catchCompleted: true });
    if (!list) {
      return;
    }

    const tasks = await Tasks.findAsync({
      projectId,
      listId: { $ne: list._id },
      completed: true
    });
    await tasks.forEachAsync(async (task) => {
      await Meteor.callAsync("tasks.move", projectId, list._id, task._id, /* move task to top */ -1);
    });
  }
});
