import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'

export const Projects = new Mongo.Collection('projects');

Meteor.methods({
  'projects.insert'(name) {
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var project = Projects.insert({
      name: name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return project;
  },

  'projects.create'(name, projectType) {
    check(name, String);
    check(projectType, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var projectId = Projects.insert({
      name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    if (projectType === 'kanban') {
      Meteor.call('lists.insert', projectId, 'A planifier');
      Meteor.call('lists.insert', projectId, 'En cours');
      Meteor.call('lists.insert', projectId, 'Terminé');
    }

    return projectId;
  },

  'projects.remove'(projectId) {
    check(projectId, String);

    Tasks.remove({projectId: projectId});
    Lists.remove({projectId: projectId});
    Projects.remove(projectId);
  },

  'projects.updateName'(projectId, name) {
    check(projectId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Projects.update({_id: projectId}, {$set: {name: name}});
  },

  'projects.clone'(projectId) {
    check(projectId, String);
    var project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error('invalid-project');
    }

    var newProjectId = Projects.insert({
      name: 'Copie de ' + project.name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    var newProject = Projects.findOne(newProjectId);
    if (!newProject) {
      throw new Meteor.Error('invalid-new-project');
    }

    var lists = Lists.find({projectId: projectId});
    lists.map(list => {
      var newListId = Lists.insert({
        name: list.name,
        order: list.order,
        projectId: newProjectId,
        createdAt: new Date(),
        createdBy: Meteor.userId()
      });

      var tasks = Tasks.find({listId: list._id});
      tasks.map(task => {
        Tasks.insert({
          name: task.name,
          order: task.order,
          description: task.description,
          notes: task.notes,
          checklist: task.checklist,
          projectId: newProjectId,
          listId: newListId,
          createdAt: new Date(),
          createdBy: Meteor.userId()
        });
      });
    });
  },

  'projects.addMember'(projectId, userId) {
    check(projectId, String);
    check(userId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    if (Projects.find({_id: projectId,  "members" : userId}).count() > 0) {
      return;
    }
    Projects.update({_id: projectId}, {$push: {members: userId}});
  },

  'projects.removeMember'(projectId, userId) {
    check(projectId, String);
    check(userId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (Projects.find({_id: projectId,  "members" : userId}).count() == 0) {
      return;
    }
    Projects.update({_id: projectId}, {$pull: {members: userId}});
    Tasks.update({projectId: projectId, assignedTo: userId}, {$set: {assignedTo: null}});
  },

  'projects.setStartDate'(projectId, startDate) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Projects.update({_id: projectId}, {$set: {startDate: startDate}});
  },

  'projects.setEndDate'(projectId, endDate) {
    check(projectId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Projects.update({_id: projectId}, {$set: {endDate: endDate}});
  },


});