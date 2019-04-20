import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { Random } from "meteor/random";
import { incrementCounter } from "./counter";
import moment from "moment";
import { checkLoggedIn, checkCanReadTask, checkCanWriteTask, checkCanDeleteTask } from "/imports/api/permissions/permissions";

export const Tasks = new Mongo.Collection("tasks");

const Counter = new Mongo.Collection("counters");

const incNumber = function() {
  return incrementCounter(Counter, "taskNumber");
};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Tasks.rawCollection().createIndex({ listId: 1 });
    Tasks.rawCollection().createIndex({ projectId: 1 });
    Tasks.rawCollection().createIndex({ deleted: 1 });
    Tasks.rawCollection().createIndex({ number: 1 }, { unique: true });
  });
}

var _checkForCompletion = function(listId, taskId) {
  var list = Lists.findOne({ _id: listId });
  if (list && list.autoComplete) {
    Tasks.update({ _id: taskId }, { $set: { completed: true } });
  }
};

Tasks.before.update(function(userId, doc, fieldNames, modifier, options) {
  const hasCompletedModification = modifier => {
    if (modifier.$set && modifier.$set.completed != undefined) {
      return true;
    }
  };

  modifier.$set = modifier.$set || {};
  modifier.$set.updatedAt = new Date();
  modifier.$set.updatedBy = userId;
  if (hasCompletedModification(modifier)) {
    // if completed flag is set, set the "completedAt" attribute
    if (modifier.$set.completed) {
      modifier.$set.completedAt = modifier.$set.updatedAt;
    } else {
      modifier.$set.completedAt = null; // reset date attribute
    }
  }
});

Meteor.methods({
  "tasks.insert"(projectId, listId, name, labelIds) {
    check(projectId, String);
    check(listId, String);
    check(name, String);
    check(labelIds, Match.Maybe([String]));

    const userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    var _findFirstOrder = function() {
      var task = Tasks.findOne(
        { projectId: projectId, listId: listId },
        { sort: { order: 1 } }
      );
      if (task) {
        return task.order;
      }
      return 0;
    };

    var completed = false;
    var list = Lists.findOne({ _id: listId });
    if (list && list.autoComplete) {
      completed = true;
    }
    const now = new Date();

    var taskId = Tasks.insert({
      name: name,
      order: _findFirstOrder() - 10,
      projectId: projectId,
      listId: listId,
      completed: completed,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      labels: labelIds || []
    });

    if (Meteor.isServer) {
      Meteor.call("tasks.setNumber", taskId);
    }
    
    Meteor.call("tasks.track", {
      type: "tasks.create",
      taskId: taskId
    });
    return Tasks.findOne({ _id: taskId });
  },

  "tasks.setNumber"(taskId) {
    const number = incNumber();
    Tasks.update({ _id: taskId }, { $set: { number: number } });
  },

  "tasks.remove"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);

    if (Meteor.isClient) {
      Tasks.remove(taskId);
      return;
    }
    
    Tasks.update({_id: taskId}, {$set: {
      deleted: true,
      deletedBy: Meteor.userId(),
      deletedAt: new Date()
    }});

    Meteor.call("tasks.track", {
      type: "tasks.remove",
      taskId: taskId
    });
  },

  "tasks.deleteForever"(taskId) {
    check(taskId, String);
    checkCanDeleteTask(taskId);
    
    Meteor.call("attachments.remove", {taskId: taskId});

    Meteor.call("tasks.track", {
      type: "tasks.deleteForever",
      taskId: taskId
    });

    Tasks.remove(taskId);
  },

  "tasks.restore"(taskId) {
    check(taskId, String);
    checkCanWriteTask(taskId);

    if (Meteor.isClient) {
      return;
    } 

    const task = Tasks.findOne({_id: taskId});
    if (!task) {
      throw new Meteor.Error("not-found");  
    }
    let listId = task.listId;
    if (!listId) {
      const list = Lists.findOne({projectId: task.projectId});
      if (list) {
        listId = list._id;
      } else {
        listId = Meteor.call("lists.insert", task.projectId, "Sans nom")._id;
      }
    }
    Tasks.update({_id: taskId}, {$set: {
      deleted: false,
      listId: listId
    }});

    Meteor.call("attachments.restore", {taskId: taskId});

    Meteor.call("tasks.track", {
      type: "tasks.restore",
      taskId: taskId
    });
  },  

  "tasks.updateName"(taskId, name) {
    check(taskId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error("invalid-name");
    }

    Tasks.update({ _id: taskId }, { $set: { name: name } });

    Meteor.call("tasks.track", {
      type: "tasks.updateName",
      taskId: taskId
    });
  },

  "tasks.updateDescription"(taskId, description) {
    check(taskId, String);
    check(description, String);
    if (description.length == 0) {
      throw new Meteor.Error("invalid-description");
    }

    Tasks.update({ _id: taskId }, { $set: { description: description } });

    Meteor.call("tasks.track", {
      type: "tasks.updateDescription",
      taskId: taskId
    });
  },

  "tasks.clone"(taskId) {
    check(taskId, String);

    checkLoggedIn();
    const userId = Meteor.userId();
    const now = new Date();

    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }
    const notes = (task.notes || []).map(note => {
      return {
        _id: Random.id(),
        createdAt: note.createdAt,
        createdBy: note.createdBy,
        edited: note.edited,
        editedBy: note.editedBy,
        content: note.content,
      };
    });

    const checklist = (task.checklist || []).map(checklist => {
      return {
        _id: Random.id(),
        createdAt: now,
        createdBy: checklist.createdBy,
        name: checklist.name,
        checked: checklist.checked
      }
    })

    const clonedTask = {
      projectId: task.projectId,
      listId: task.listId,
      name: "Copie de " + task.name,
      description: task.description,
      order: task.order - 1,
      completed: task.completed,
      assignedTo: task.assignedTo,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      labels: task.labels,
      notes: notes,
      checklist: checklist,
      startDate: task.startDate,
      dueDate: task.dueDate,
      resources: task.resources
    };

    const clonedTaskId = Tasks.insert(clonedTask);
    if (Meteor.isServer) {
      Meteor.call("tasks.setNumber", clonedTaskId);
    }

    var _reorder = function(listId) {
      var tasks = Tasks.find(
        { listId: listId },
        { sort: { order: 1 } }
      ).fetch();
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        task.order = i * 10;

        Tasks.direct.update({ _id: task._id }, { $set: { order: task.order } });
      }
    };
    _reorder(clonedTask.listId);

    Meteor.call("tasks.track", {
      type: "tasks.create",
      taskId: clonedTaskId
    });
    return Tasks.findOne({ _id: clonedTaskId });
  },

  "tasks.complete"(taskId, completed) {
    check(taskId, String);
    check(completed, Boolean);

    Tasks.update({ _id: taskId }, { $set: { completed: completed } });
    const task = Tasks.findOne({ _id: taskId });
    Meteor.call("lists.findTasksToCatch", task.projectId);
    Meteor.call("tasks.track", {
      type: "tasks.complete",
      taskId: taskId
    });
  },

  "tasks.move"(projectId, listId, taskId, order) {
    check(listId, String);
    check(taskId, String);

    _checkForCompletion(listId, taskId);

    var _reorder = function(listId) {
      var tasks = Tasks.find(
        { listId: listId },
        { sort: { order: 1 } }
      ).fetch();
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        task.order = i * 10;

        Tasks.direct.update({ _id: task._id }, { $set: { order: task.order } });
      }
    };
    if (order) {
      Tasks.direct.update(
        { _id: taskId },
        { $set: { listId: listId, order: order } },
        {},
        (error, result) => {
          _reorder(listId);
        }
      );
    } else {
      var lastTask = Tasks.findOne(
        { projectId: projectId, listId: listId },
        { sort: { order: -1 } }
      );
      if (lastTask) {
        order = lastTask.order + 10;
      } else {
        order = 10;
      }
      Tasks.direct.update(
        { _id: taskId },
        { $set: { listId: listId, order: order } },
        {}
      );
    }

    Meteor.call("tasks.track", {
      type: "tasks.move",
      taskId: taskId
    });
  },

  "tasks.addNote"(taskId, content) {
    check(taskId, String);
    check(content, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var note = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      content: content
    };

    Tasks.update({ _id: taskId }, { $push: { notes: note } });

    Meteor.call("tasks.track", {
      type: "tasks.addNote",
      taskId: taskId
    });
  },

  "tasks.removeNote"(taskId, noteId) {
    check(taskId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (noteId) {
      Tasks.update({ _id: taskId }, { $pull: { notes: { _id: noteId } } });
    } else {
      Tasks.update({ _id: taskId }, { $set: { notes: [] } });
    }

    Meteor.call("tasks.track", {
      type: "tasks.removeNote",
      taskId: taskId
    });
  },

  "tasks.updateNote"(taskId, note) {
    check(taskId, String);
    check(note, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

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
      taskId: taskId
    });
  },

  "tasks.addChecklistItem"(taskId, name) {
    check(taskId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var item = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      name: name,
      checked: false
    };

    Tasks.update({ _id: taskId }, { $push: { checklist: item } });

    Meteor.call("tasks.track", {
      type: "tasks.addChecklistItem",
      taskId: taskId
    });
  },

  "tasks.removeChecklistItem"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update({ _id: taskId }, { $pull: { checklist: { _id: itemId } } });

    Meteor.call("tasks.track", {
      type: "tasks.removeChecklistItem",
      taskId: taskId
    });
  },

  "tasks.toggleCheckItem"(taskId, itemId, checked) {
    check(taskId, String);
    check(itemId, String);
    check(checked, Boolean);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(
      { _id: taskId, "checklist._id": itemId },
      { $set: { "checklist.$.checked": checked } }
    );

    Meteor.call("tasks.track", {
      type: "tasks.toggleCheckItem",
      taskId: taskId
    });
  },

  "tasks.convertItemToTask"(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var task = Tasks.findOne({ _id: taskId, "checklist._id": itemId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    var item = task.checklist.find(item => {
      return item._id === itemId;
    });

    Meteor.call("tasks.track", {
      type: "tasks.convertItemToTask",
      taskId: taskId,
      properties: {
        item: item
      }
    });

    Meteor.call("tasks.insert", task.projectId, task.listId, item.name);
    Meteor.call("tasks.removeChecklistItem", taskId, itemId);
  },

  "tasks.updateCheckListItem"(taskId, item) {
    check(taskId, String);
    check(item, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    const itemIndex = task.checklist.findIndex(aItem => {
      return aItem._id === item._id;
    });
    task.checklist[itemIndex] = item;
    Tasks.update({ _id: taskId }, { $set: { checklist: task.checklist } });
  },

  "tasks.updateCheckList"(taskId, checklist) {
    check(taskId, String);
    check(checklist, Array);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }

    Tasks.update({ _id: taskId }, { $set: { checklist: checklist } });
  },

  "tasks.assignTo"(taskId, userId) {
    check(taskId, String);
    check(userId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("task-not-found");
    }
    Tasks.update({ _id: taskId }, { $set: { assignedTo: userId } });
    Meteor.call("projects.addMember", {
      projectId: task.projectId,
      userId: userId
    });
    Meteor.call("tasks.track", {
      type: "tasks.assignTo",
      taskId: taskId
    });
  },

  "tasks.removeAssignedTo"(taskId) {
    check(taskId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update({ _id: taskId }, { $set: { assignedTo: null } });

    Meteor.call("tasks.track", {
      type: "tasks.removeAssignedTo",
      taskId: taskId
    });
  },

  "tasks.setDueDate"(taskId, dueDate) {
    check(taskId, String);
    check(dueDate, String);

    const convertedDate = moment(dueDate, "YYYY-MM-DD HH:mm").toDate();

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update({ _id: taskId }, { $set: { dueDate: convertedDate } });

    Meteor.call("tasks.track", {
      type: "tasks.setDueDate",
      taskId: taskId
    });
  },

  "tasks.setStartDate"(taskId, startDate) {
    check(taskId, String);
    check(startDate, String);

    const convertedDate = moment(startDate, "YYYY-MM-DD HH:mm").toDate();

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update({ _id: taskId }, { $set: { startDate: convertedDate } });

    Meteor.call("tasks.track", {
      type: "tasks.setStartDate",
      taskId: taskId
    });
  },

  "tasks.addLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if (Tasks.find({ _id: taskId, labels: labelId }).count() > 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $push: { labels: labelId } });

    Meteor.call("tasks.track", {
      type: "tasks.addLabel",
      taskId: taskId
    });
  },

  "tasks.removeLabel"(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (Tasks.find({ _id: taskId, labels: labelId }).count() == 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { labels: labelId } });

    Meteor.call("tasks.track", {
      type: "tasks.removeLabel",
      taskId: taskId
    });
  },

  "tasks.addResource"(taskId, resourceId) {
    check(taskId, String);
    check(resourceId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if (Tasks.find({ _id: taskId, resources: resourceId }).count() > 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $push: { resources: resourceId } });

    Meteor.call("tasks.track", {
      type: "tasks.addResource",
      taskId: taskId
    });
  },

  "tasks.removeResource"(taskId, resourceId) {
    check(taskId, String);
    check(resourceId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (Tasks.find({ _id: taskId, resources: resourceId }).count() == 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { resources: resourceId } });

    Meteor.call("tasks.track", {
      type: "tasks.removeResource",
      taskId: taskId
    });
  },

  "tasks.track"(event) {
    if (!Meteor.isServer) {
      return;
    }
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
      properties: properties
    });
  }
});

if (Meteor.isServer) {
  Meteor.methods({
    "tasks.getUrl"(taskNumber) {
      check(taskNumber, Number);
      checkLoggedIn();

      const task = Tasks.findOne({ number: taskNumber });
      if (!task) {
        throw new Meteor.Error("not-found");
      }
      const canAccess = Meteor.call("permissions.canReadProject", {
        projectId: task.projectId
      });
      if (!canAccess) {
        throw new Meteor.Error("not-authorized");
      }
      return {
        projectId: task.projectId,
        taskId: task._id
      };
    }
  });
}
