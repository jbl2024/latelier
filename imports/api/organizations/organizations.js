import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import {
  Projects,
  ProjectAccessRights
} from "/imports/api/projects/projects.js";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";

import OrganizationSchema from "./schema";

import {
  Permissions,
  checkLoggedIn,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

export const Organizations = new Mongo.Collection("organizations");
Organizations.attachSchema(OrganizationSchema);
Organizations.methods = {};

const checkCanManage = (id) => {
  if (
    Permissions.isAdmin(Meteor.userId(), id)
    || Permissions.isAdmin(Meteor.userId())
  ) {
    return true;
  }
  throw new Meteor.Error("not-authorized");
};

Organizations.methods.create = new ValidatedMethod({
  name: "organizations.create",
  validate: new SimpleSchema({
    name: { type: String }
  }).validator(),
  run({ name }) {
    checkLoggedIn();
    check(name, String);
    const currentUser = Meteor.userId();
    const organizationId = Organizations.insert({
      name,
      createdAt: new Date(),
      createdBy: currentUser
    });
    Meteor.call("permissions.initializeOrganizationPermissions", {
      organizationId
    });
    Meteor.call("organizations.addMember", {
      organizationId,
      userId: currentUser
    });
    return organizationId;
  }
});

Organizations.methods.fixOrphanProjectGroups = new ValidatedMethod({
  name: "organizations.fixOrphanProjectGroups",
  validate: null,
  run() {
    ProjectGroups.remove({ organizationId: { $exists: false } });
  }
});

Organizations.methods.remove = new ValidatedMethod({
  name: "organizations.remove",
  validate: new SimpleSchema({
    organizationId: { type: String }
  }).validator(),
  run({ organizationId }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    const organization = Organizations.findOne({ _id: organizationId });

    let canDelete = false;
    if (
      Permissions.isAdmin(Meteor.userId())
      || organization.createdBy === Meteor.userId()
    ) {
      canDelete = true;
    }

    if (!canDelete) {
      throw new Meteor.Error("permission-error");
    }

    Projects.update(
      { organizationId },
      { $unset: { organizationId: 1 } },
      { multi: true }
    );
    Organizations.remove(organizationId);

    Meteor.call("organizations.fixOrphanProjectGroups");
  }
});

Organizations.methods.updateName = new ValidatedMethod({
  name: "organizations.updateName",
  validate: new SimpleSchema({
    organizationId: { type: String },
    name: { type: String }
  }).validator(),
  run({ organizationId, name }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    Organizations.update({ _id: organizationId }, { $set: { name } });
  }
});

Organizations.methods.updateDescription = new ValidatedMethod({
  name: "organizations.updateDescription",
  validate: new SimpleSchema({
    organizationId: { type: String },
    description: { type: String }
  }).validator(),
  run({ organizationId, description }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    Organizations.update({ _id: organizationId }, { $set: { description } });
  }
});

Organizations.methods.moveProject = new ValidatedMethod({
  name: "organizations.moveProject",
  validate: new SimpleSchema({
    organizationId: { type: String },
    projectId: { type: String }
  }).validator(),
  run({ organizationId, projectId }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);
    ProjectGroups.update(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );
    Projects.update({ _id: projectId }, { $set: { organizationId } });
  }
});

Organizations.methods.addMember = new ValidatedMethod({
  name: "organizations.addMember",
  validate: new SimpleSchema({
    organizationId: { type: String },
    userId: { type: String }
  }).validator(),
  run({ organizationId, userId }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    if (
      Organizations.find({ _id: organizationId, members: userId }).count() > 0
    ) {
      return;
    }
    Organizations.update(
      { _id: organizationId },
      { $push: { members: userId } }
    );

    const projects = Projects.find({
      organizationId,
      accessRights: ProjectAccessRights.ORGANIZATION
    });
    projects.forEach((project) => {
      try {
        Meteor.call("projects.addMember", {
          projectId: project._id,
          userId
        });
      } catch (error) {
        //
      }
    });
  }
});

Organizations.methods.removeMember = new ValidatedMethod({
  name: "organizations.removeMember",
  validate: new SimpleSchema({
    organizationId: { type: String },
    userId: { type: String }
  }).validator(),
  run({ organizationId, userId }) {
    checkLoggedIn();
    checkCanManage(organizationId);

    const organization = Organizations.findOne({ _id: organizationId });
    if (!organization) {
      throw new Meteor.Error("not-found");
    }
    const members = organization.members || [];
    if (members.length <= 1) {
      throw new Meteor.Error("cannot empty all members");
    }

    if (
      Organizations.find({ _id: organizationId, members: userId }).count() === 0
    ) {
      return;
    }

    const projects = Projects.find({
      organizationId,
      accessRights: ProjectAccessRights.ORGANIZATION
    });
    projects.forEach((project) => {
      try {
        Meteor.call("projects.removeMember", {
          projectId: project._id,
          userId
        });
      } catch (error) {
        //
      }
    });

    if (Permissions.isAdmin(userId, organizationId)) {
      Permissions.removeAdmin(userId, organizationId);
    }

    Organizations.update(
      { _id: organizationId },
      { $pull: { members: userId } }
    );
  }
});

Organizations.methods.propagateMembership = new ValidatedMethod({
  name: "organizations.propagateMembership",
  validate: new SimpleSchema({
    organizationId: { type: String },
    projectId: { type: String }
  }).validator(),
  run({ organizationId, projectId }) {
    checkLoggedIn();
    checkCanManage(projectId);
    const organization = Organizations.findOne({ _id: organizationId });
    if (!organization) {
      throw new Meteor.Error("not-found");
    }
    const members = organization.members || [];
    members.forEach((member) => {
      Meteor.call("projects.addMember", {
        projectId,
        userId: member
      });

      if (Permissions.isAdmin(member, organizationId)) {
        Permissions.setAdmin(member, projectId);
      }
    });
  }
});

Organizations.methods.setAdmin = new ValidatedMethod({
  name: "organizations.setAdmin",
  validate: new SimpleSchema({
    organizationId: { type: String },
    userId: { type: String }
  }).validator(),
  run({ organizationId, userId }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    Permissions.methods.setAdmin.call({
      userId,
      scope: organizationId
    });
    const projects = Projects.find({
      organizationId,
      accessRights: ProjectAccessRights.ORGANIZATION
    });
    projects.forEach((project) => {
      try {
        Permissions.methods.setAdmin.call({
          userId,
          scope: project._id
        });
      } catch (error) {
        //
      }
    });
  }
});

Organizations.methods.removeAdmin = new ValidatedMethod({
  name: "organizations.removeAdmin",
  validate: new SimpleSchema({
    organizationId: { type: String },
    userId: { type: String }
  }).validator(),
  run({ organizationId, userId }) {
    checkLoggedIn();
    checkCanManage(organizationId);
    Permissions.methods.removeAdmin.call({
      userId,
      scope: organizationId
    });
    const projects = Projects.find({
      organizationId,
      accessRights: ProjectAccessRights.ORGANIZATION
    });
    projects.forEach((project) => {
      try {
        Permissions.methods.removeAdmin.call({
          userId,
          scope: project._id
        });
      } catch (error) {
        //
      }
    });
  }
});
