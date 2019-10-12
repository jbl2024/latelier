import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import ProjectGroupSchema from "./schema";

export const ProjectGroups = new Mongo.Collection('projectGroups');
ProjectGroups.attachSchema(ProjectGroupSchema);

if (Meteor.isServer) {
  Meteor.startup(() => {
    ProjectGroups.rawCollection().createIndex({organizationId: 1});
  });
}

Meteor.methods({
  'projectGroups.create'(organizationId, name) {
    check(organizationId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var projectGroupId = ProjectGroups.insert({
      organizationId: organizationId,
      name: name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return projectGroupId;
  },

  'projectGroups.remove'(projectGroupId) {
    check(projectGroupId, String);

    ProjectGroups.remove(projectGroupId);
  },

  'projectGroups.updateName'(projectGroupId, name) {
    check(projectGroupId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    ProjectGroups.update({_id: projectGroupId}, {$set: {name: name}});
  },


  'projectGroups.addProject'(projectGroupId, projectId) {
    check(projectGroupId, String);
    check(projectId, String);
    
    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (ProjectGroups.find({_id: projectGroupId,  "projects" : projectId}).count() > 0) {
      return;
    }
    ProjectGroups.update({_id: projectGroupId}, {$push: {projects: projectId}});
  },

  'projectGroups.removeProject'(projectGroupId, projectId) {
    check(projectGroupId, String);
    check(projectId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    if (ProjectGroups.find({_id: projectGroupId,  "projects" : projectId}).count() == 0) {
      return;
    }
    ProjectGroups.update({_id: projectGroupId}, {$pull: {projects: projectId}});
  },
});