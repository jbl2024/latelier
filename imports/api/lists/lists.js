import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { relativeTimeRounding } from "moment";

export const Lists = new Mongo.Collection("lists");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Lists.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  "lists.insert"(projectId, name, autoComplete, catchCompleted) {
    check(projectId, String);
    check(name, String);

    if (!autoComplete) autoComplete = false;
    if (!catchCompleted) catchCompleted = false;

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var _findLastOrder = function() {
      var list = Lists.findOne(
        { projectId: projectId },
        { sort: { order: -1 } }
      );
      if (list) {
        return list.order;
      }
      return 0;
    };

    var listId = Lists.insert({
      name: name,
      order: _findLastOrder() + 1,
      autoComplete: autoComplete,
      catchCompleted: catchCompleted,
      projectId: projectId,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return Lists.findOne({ _id: listId });
  },

  "lists.remove"(listId) {
    check(listId, String);

    const tasks = Tasks.find({ listId: listId });
    tasks.map(task => {
      Tasks.update({_id: task._id}, {$set: {listId: null}});
      Meteor.call("tasks.remove", task._id);
    })

    Lists.remove(listId);
  },

  "lists.updateName"(listId, name) {
    check(listId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error("invalid-name");
    }

    Lists.update({ _id: listId }, { $set: { name: name } });
  },

  "lists.move"(projectId, listId, order) {
    check(projectId, String);
    check(listId, String);
    check(order, Number);

    var _reorder = function(projectId) {
      var lists = Lists.find(
        { projectId: projectId },
        { sort: { order: 1 } }
      ).fetch();
      for (var i = 0; i < lists.length; i++) {
        var list = lists[i];
        list.order = i + 1;
        Lists.update({ _id: list._id }, { $set: { order: list.order } });
      }
    };

    if (order == -1) {
      var lastList = Lists.findOne(
        { projectId: projectId },
        { sort: { order: -1 } }
      );
      if (lastList) {
        order = lastList.order + 1;
      } else {
        order = 1;
      }
    }
    Lists.update(
      { _id: listId },
      { $set: { order: order } },
      {},
      (error, result) => {
        _reorder(projectId);
      }
    );
  },

  "lists.autoComplete"(listId, autoComplete) {
    check(listId, String);
    check(autoComplete, Boolean);

    Lists.update({ _id: listId }, { $set: { autoComplete: autoComplete } });
    if (autoComplete) {
      Tasks.update(
        { listId: listId },
        { $set: { completed: true } },
        { multi: true }
      );
    }
  },

  "lists.catchCompleted"(listId, catchCompleted) {
    check(listId, String);
    check(catchCompleted, Boolean);

    Lists.update({ _id: listId }, { $set: { catchCompleted: catchCompleted } });
    if (catchCompleted) {
      const list = Lists.findOne({ _id: listId });
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
    const list = Lists.findOne({ projectId: projectId, catchCompleted: true });
    if (!list) {
      return;
    }

    const tasks = Tasks.find({
      projectId: projectId,
      listId: { $ne: list._id },
      completed: true
    });
    tasks.map(task => {
      Meteor.call("tasks.move", projectId, list._id, task._id, 0);
    });
  }
});
