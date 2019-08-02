import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { checkLoggedIn } from "/imports/api/permissions/permissions"
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";

Meteor.publish("usersInOrganization", function usersInOrganization(organizationId) {
  checkLoggedIn();
  if (!organizationId) {
    this.ready();
    return;
  }  
  const organization = Organizations.findOne({_id: organizationId});
  if (!organization) {
    throw new Meteor.Error('not-found');
  }
  var members = organization.members || [];
  return Meteor.users.find(
    { _id: { $in: members } },
    { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 , roles: 1} }
  );
});

Meteor.publish("usersInProject", function usersInProject(projectId) {
  checkLoggedIn();
  const project = Projects.findOne({_id: projectId});
  if (!project) {
    throw new Meteor.Error('not-found');
  }

  let members = project.members || [];
  if (project.organizationId) {
    const organization = Organizations.findOne({_id: project.organizationId});
    members = members.concat(organization.members || []);
  }
  return Meteor.users.find(
    { _id: { $in: members } },
    { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 , roles: 1} }
  );
});

Meteor.publish("user", function() {
  return Meteor.users.find(
    {
      _id: this.userId
    },
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1,
        notifications: 1
      }
    }
  );
});

Meteor.publish("userEmailSettings", function() {
  return Meteor.users.find(
    {
      _id: this.userId
    },
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1,
        roles: 1,
        emailSettings: 1
      }
    }
  );
});
