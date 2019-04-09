import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { Projects } from '/imports/api/projects/projects.js'
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'
import { Permissions } from "/imports/api/permissions/permissions"


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
    Meteor.call('organizations.addMember', organizationId, currentUser);

    return organizationId;
  },

  'organizations.fixOrphanProjectGroups' () {
    ProjectGroups.remove({ organizationId : { $exists: false } });
  },

  'organizations.remove'(organizationId) {
    check(organizationId, String);

    const organization = Organizations.findOne({_id: organizationId});

    let canDelete = false;
    if (Permissions.isAdmin(Meteor.userId()) || organization.createdBy === Meteor.userId()) {
      canDelete = true; 
    };

    if (!canDelete) {
      throw new Meteor.Error('permission-error');
    }

    Projects.update({organizationId: organizationId}, {$unset: {organizationId: 1}}, {multi: true});
    Organizations.remove(organizationId);

    Meteor.call('organizations.fixOrphanProjectGroups');
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
    check(organizationId, Match.Maybe(String));
    check(projectId, String);

    ProjectGroups.update({ projects: projectId }, { $pull: { projects: projectId } });
    Projects.update({ _id: projectId }, { $set: { organizationId: organizationId } });
  },

  'organizations.addMember'(organizationId, userId) {
    check(organizationId, String);
    check(userId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    if (Organizations.find({_id: organizationId,  "members" : userId}).count() > 0) {
      return;
    }
    Organizations.update({_id: organizationId}, {$push: {members: userId}});
  },

  'organizations.removeMember'(organizationId, userId) {
    check(organizationId, String);
    check(userId, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const organization = Organizations.findOne({_id: organizationId});
    if (!organization) {
      throw new Meteor.Error('not-found');
    }
    const members = organization.members || [];
    if (members.length <= 1) {
      throw new Meteor.Error('cannot empty all members');
    }

    const projects = Projects.find({organizationId: organizationId});
    projects.map(project => {
      Meteor.call('projects.removeMember', project._id, userId);
    });

    if (Organizations.find({_id: organizationId,  "members" : userId}).count() == 0) {
      return;
    }
    Organizations.update({_id: organizationId}, {$pull: {members: userId}});

  },

});