import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Lists } from '/imports/api/lists/lists.js'
import { Random } from 'meteor/random'

export const Tasks = new Mongo.Collection('tasks');

var _checkForCompletion = function(listId, taskId) {
  var list = Lists.findOne({_id: listId});
  if (list && list.autoComplete) {
    Tasks.update({_id: taskId}, {$set: {completed: true}});
  }
}

Meteor.methods({
  'tasks.insert'(projectId, listId, name) {
    check(projectId, String);
    check(listId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var _findLastOrder = function () {
      var task = Tasks.findOne({projectId: projectId, listId: listId}, {sort: {order: -1}});
      if (task) {
        return task.order;
      }
      return 0;
    }

    var completed = false;
    var list = Lists.findOne({_id: listId});
    if (list && list.autoComplete) {
      completed = true;
    }
    var taskId = Tasks.insert({
      name: name,
      order: _findLastOrder() + 1,
      projectId: projectId,
      listId: listId,
      completed: completed,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return Tasks.findOne({_id: taskId});
  },

  'tasks.remove'(taskId) {
    check(taskId, String);

    Tasks.remove(taskId);
  },

  'tasks.updateName'(taskId, name) {
    check(taskId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Tasks.update({_id: taskId}, {$set: {name: name}});
  },

  'tasks.updateDescription'(taskId, description) {
    check(taskId, String);
    check(description, String);
    if (description.length == 0) {
      throw new Meteor.Error('invalid-description');
    }

    Tasks.update({_id: taskId}, {$set: {description: description}});
  },

  'tasks.complete'(taskId, completed) {
    check(taskId, String);
    check(completed, Boolean);
    Tasks.update({_id: taskId}, {$set: {completed: completed}});
  },

  'tasks.move'(projectId, listId, taskId, order) {
    check(listId, String);
    check(taskId, String);
    check(order, Number);

    _checkForCompletion(listId, taskId);

    var _reorder = function (listId) {
      var tasks = Tasks.find({listId: listId}, {sort: {order: 1}}).fetch();
      for (var i = 0; i < tasks.length; i++) {
        var task  = tasks[i];
        task.order = i + 1;
        Tasks.update({_id: task._id}, {$set: {order: task.order}});
      }
    }

    if (order != -1 && order != 0) {
      Tasks.update({listId: listId, order: {$gt: order}}, {$inc: {order: 1}}, {}, (error, result) => {
        Tasks.update({_id: taskId}, {$set: {listId: listId, order: order + 1}}, {}, (error, result) => {
          _reorder(listId);
        });
      });

    } else if (order == 0) {
      Tasks.update({_id: taskId}, {$set: {listId: listId, order: order}}, {}, (error, result) => {
        _reorder(listId);
      });
    } else {
      var lastTask = Tasks.findOne({projectId: projectId, listId: listId}, {sort: {order: -1}});
      if (lastTask) {
        order = lastTask.order + 1;
      } else {
        order = 1;
      }
      Tasks.update({_id: taskId}, {$set: {listId: listId, order: order}}, {}, (error, result) => {
        _reorder(listId);
      });
    }
  },

  'tasks.addNote'(taskId, content) {
    check(taskId, String);
    check(content, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var note = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      content: content
    };

    Tasks.update({_id: taskId}, {$push: {notes: note}});
  },

  'tasks.removeNote'(taskId, noteId) {
    check(taskId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (noteId) {
      Tasks.update({_id: taskId},  { $pull: { notes: { _id: noteId } } });
    } else {
      Tasks.update({_id: taskId},  { $set: { notes: [] } });
    }
  },

  'tasks.addChecklistItem'(taskId, name) {
    check(taskId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var item = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      name: name,
      checked: false
    };

    Tasks.update({_id: taskId}, {$push: {checklist: item}});
  },

  'tasks.removeChecklistItem'(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId},  { $pull: { checklist: { _id: itemId } } });
  },

  'tasks.toggleCheckItem'(taskId, itemId, checked) {
    check(taskId, String);
    check(itemId, String);
    check(checked, Boolean);
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId, "checklist._id" : itemId}, {$set : {"checklist.$.checked" : checked}});
  },


  'tasks.convertItemToTask'(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var task = Tasks.findOne({_id: taskId, "checklist._id" : itemId});
    if (!task) {
      throw new Meteor.Error('task-not-found');
    }

    var item = task.checklist.find(item => {
      return item._id === itemId;
    });

    Meteor.call('tasks.insert', task.projectId, task.listId, item.name);
    Meteor.call('tasks.removeChecklistItem', taskId, itemId);
  },

  'tasks.assignTo'(taskId, userId) {
    check(taskId, String);
    check(userId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {assignedTo: userId}});
  },

  'tasks.removeAssignedTo'(taskId) {
    check(taskId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {assignedTo: null}});
  },


});