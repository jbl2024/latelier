import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { Lists } from '/imports/api/lists/lists.js'
import { Attachments } from "/imports/api/attachments/attachments";
import { Random } from 'meteor/random'

export const Tasks = new Mongo.Collection('tasks');
if (Meteor.isServer) {
  Meteor.startup(() => {
    Tasks.rawCollection().createIndex({listId: 1});
    Tasks.rawCollection().createIndex({projectId: 1});
  });
}

var _checkForCompletion = function(listId, taskId) {
  var list = Lists.findOne({_id: listId});
  if (list && list.autoComplete) {
    Tasks.update({_id: taskId}, {$set: {completed: true}});
  }
}

Tasks.before.update(function (userId, doc, fieldNames, modifier, options) {
 
  const hasOrderModification = modifier =>  {
    if (modifier.$set && modifier.$set.order != undefined) {
      if (Object.keys(modifier.$set).length === 1) {
        return true;
      }
    }
    if (modifier.$inc && modifier.$inc.order) {
      return true;
    }
    return false;
  };

  const hasCompletedModification = modifier => {
    if (modifier.$set && modifier.$set.completed != undefined) { 
      return true;
    }
  }

  if (hasOrderModification(modifier)) {
    // do not pollute update history with minor order modifications
    return;
  }

  modifier.$set = modifier.$set || {};
  modifier.$set.updatedAt = new Date();

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
      updatedAt: new Date(),
      createdBy: Meteor.userId()
    });

    Meteor.call('tasks.track', {
      type: 'tasks.create',
      taskId: taskId
    });

    return Tasks.findOne({_id: taskId});
  },

  'tasks.remove'(taskId) {
    check(taskId, String);

    Meteor.call('tasks.track', {
      type: 'tasks.remove',
      taskId: taskId
    });

    Attachments.remove({'meta.taskId': taskId});
    Tasks.remove(taskId);
  },

  'tasks.updateName'(taskId, name) {
    check(taskId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Tasks.update({_id: taskId}, {$set: {name: name}});

    Meteor.call('tasks.track', {
      type: 'tasks.updateName',
      taskId: taskId
    });
  },

  'tasks.updateDescription'(taskId, description) {
    check(taskId, String);
    check(description, String);
    if (description.length == 0) {
      throw new Meteor.Error('invalid-description');
    }

    Tasks.update({_id: taskId}, {$set: {description: description}});

    Meteor.call('tasks.track', {
      type: 'tasks.updateDescription',
      taskId: taskId
    });
  },

  'tasks.complete'(taskId, completed) {
    check(taskId, String);
    check(completed, Boolean);

    Tasks.update({_id: taskId}, {$set: {completed: completed}});
    const task = Tasks.findOne({_id: taskId});
    Meteor.call('lists.findTasksToCatch', task.projectId);
    Meteor.call('tasks.track', {
      type: 'tasks.complete',
      taskId: taskId
    });
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

    Meteor.call('tasks.track', {
      type: 'tasks.move',
      taskId: taskId
    });

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

    Meteor.call('tasks.track', {
      type: 'tasks.update',
      taskId: taskId
    });

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

    Meteor.call('tasks.removeNote', {
      type: 'tasks.update',
      taskId: taskId
    });
  },

  'tasks.updateNote'(taskId, note) {
    check(taskId, String);
    check(note, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update({
      _id: taskId, 
      "notes._id": note._id
    },  { 
      $set: { 
        "notes.$.content":  note.content,
        "notes.$.edited":  true
      } 
    });
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

    Meteor.call('tasks.track', {
      type: 'tasks.addChecklistItem',
      taskId: taskId
    });

  },

  'tasks.removeChecklistItem'(taskId, itemId) {
    check(taskId, String);
    check(itemId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId},  { $pull: { checklist: { _id: itemId } } });

    Meteor.call('tasks.track', {
      type: 'tasks.removeChecklistItem',
      taskId: taskId
    });
  },

  'tasks.toggleCheckItem'(taskId, itemId, checked) {
    check(taskId, String);
    check(itemId, String);
    check(checked, Boolean);
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId, "checklist._id" : itemId}, {$set : {"checklist.$.checked" : checked}});

    Meteor.call('tasks.track', {
      type: 'tasks.toggleCheckItem',
      taskId: taskId
    });
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

    Meteor.call('tasks.track', {
      type: 'tasks.convertItemToTask',
      taskId: taskId,
      properties: {
        item: item
      }
    });

    Meteor.call('tasks.insert', task.projectId, task.listId, item.name);
    Meteor.call('tasks.removeChecklistItem', taskId, itemId);
  },

  'tasks.updateCheckListItem'(taskId, item) {
    check(taskId, String);
    check(item, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var task = Tasks.findOne({_id: taskId});
    if (!task) {
      throw new Meteor.Error('task-not-found');
    }

    const itemIndex = task.checklist.findIndex(aItem => {
      return aItem._id === item._id;
    });
    task.checklist[itemIndex] = item;
    Tasks.update({_id: taskId}, {$set: {checklist: task.checklist}});
  },

  'tasks.assignTo'(taskId, userId) {
    check(taskId, String);
    check(userId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {assignedTo: userId}});

    Meteor.call('tasks.track', {
      type: 'tasks.assignTo',
      taskId: taskId,
    });
  },

  'tasks.removeAssignedTo'(taskId) {
    check(taskId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {assignedTo: null}});

    Meteor.call('tasks.track', {
      type: 'tasks.removeAssignedTo',
      taskId: taskId,
    });

  },

  'tasks.setDueDate'(taskId, dueDate) {
    check(taskId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {dueDate: dueDate}});

    Meteor.call('tasks.track', {
      type: 'tasks.setDueDate',
      taskId: taskId,
    });
  },

  'tasks.setStartDate'(taskId, startDate) {
    check(taskId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update({_id: taskId}, {$set: {startDate: startDate}});

    Meteor.call('tasks.track', {
      type: 'tasks.setStartDate',
      taskId: taskId,
    });
  },

  'tasks.addLabel'(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    if (Tasks.find({ _id: taskId, "labels": labelId }).count() > 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $push: { labels: labelId } });

    Meteor.call('tasks.track', {
      type: 'tasks.addLabel',
      taskId: taskId
    });
  },

  'tasks.removeLabel'(taskId, labelId) {
    check(taskId, String);
    check(labelId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (Tasks.find({ _id: taskId, "labels": labelId }).count() == 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { labels: labelId } });

    Meteor.call('tasks.track', {
      type: 'tasks.removeLabel',
      taskId: taskId
    });
  },  

  'tasks.addResource'(taskId, resourceId) {
    check(taskId, String);
    check(resourceId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    if (Tasks.find({ _id: taskId, "resources": resourceId }).count() > 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $push: { resources: resourceId } });

    Meteor.call('tasks.track', {
      type: 'tasks.addResource',
      taskId: taskId
    });
  },

  'tasks.removeResource'(taskId, resourceId) {
    check(taskId, String);
    check(resourceId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (Tasks.find({ _id: taskId, "resources": resourceId }).count() == 0) {
      return;
    }
    Tasks.update({ _id: taskId }, { $pull: { resources: resourceId } });

    Meteor.call('tasks.track', {
      type: 'tasks.removeResource',
      taskId: taskId
    });
  }, 
  
  
  'tasks.track' (event) {
    this.unblock();

    check(event, {
      taskId: String,
      type: String,
      properties: Match.Optional(Object)
    });
    
    const task = Tasks.findOne({_id: event.taskId});
    const properties = event.properties || {};

    properties.task = task;

    Meteor.call('events.track', {
      type: event.type,
      properties: properties
    })
  }
});