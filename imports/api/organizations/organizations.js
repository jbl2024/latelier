import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Projects } from '/imports/api/projects/projects.js'
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'

export const Organizations = new Mongo.Collection('organizations');

Meteor.methods({
  'organizations.create'(name) {
    check(name, String);
    const currentUser = Meteor.userId();

    // Make sure the user is logged in before inserting a task
    if (!currentUser) {
      throw new Meteor.Error('not-authorized');
    }

    const organizationId = Organizations.insert({
      name,
      createdAt: new Date(),
      createdBy: currentUser
    });
    return organizationId;
  },

  'organizations.remove'(organizationId) {
    check(organizationId, String);

    Organizations.remove(organizationId);
  },

  'organizations.updateName'(organizationId, name) {
    check(organizationId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Organizations.update({_id: organizationId}, {$set: {name: name}});
  },

  'organizations.updateDescription'(organizationId, description) {
    check(organizationId, String);
    check(description, String);
    if (description.length == 0) {
      throw new Meteor.Error('invalid-description');
    }
    Organizations.update({ _id: organizationId }, { $set: { description: description } });
  },

  'organizations.moveProject'(organizationId, projectId) {
    check(organizationId, String);
    check(projectId, String);

    ProjectGroups.update({ projects: projectId }, { $pull: { projects: projectId } });
    Projects.update({ _id: projectId }, { $set: { organizationId: organizationId } });
  }
});