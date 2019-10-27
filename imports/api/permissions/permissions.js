import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";

const ApplicationRoles = Object.freeze({
  ADMIN: "admin",
  INACTIVE: "inactive"
});

export const Permissions = {
  isAdmin(userId, scope = Roles.GLOBAL_GROUP) {
    if (!userId) {
      return false;
    }
    return Roles.userIsInRole(userId, ApplicationRoles.ADMIN, scope);
  },

  setAdmin(userId, scope = Roles.GLOBAL_GROUP) {
    let accessGranted = false;
    if (this.isAdmin(Meteor.userId())) {
      accessGranted = true;
    } else if (this.isAdmin(Meteor.userId(), scope)) {
      accessGranted = true;
    }
    if (!accessGranted) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, scope);
  },

  initializeProjectPermissions(project) {
    Roles.addUsersToRoles(
      project.createdBy,
      ApplicationRoles.ADMIN,
      project._id
    );
  },

  initializeOrganizationPermissions(organization) {
    Roles.addUsersToRoles(
      organization.createdBy,
      ApplicationRoles.ADMIN,
      organization._id
    );
  },

  removeAdmin(userId, scope = Roles.GLOBAL_GROUP) {
    let accessGranted = false;
    if (this.isAdmin(Meteor.userId())) {
      accessGranted = true;
    } else if (this.isAdmin(Meteor.userId(), scope)) {
      accessGranted = true;
    }
    if (!accessGranted) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (scope === Roles.GLOBAL_GROUP) {
      if (Meteor.userId() === userId) {
        throw new Meteor.Error(401, "cannot-remove-self");
      }
    }
    Roles.removeUsersFromRoles(userId, ApplicationRoles.ADMIN, scope);
  },

  isActive(userId) {
    if (!userId) {
      return false;
    }
    return !Roles.userIsInRole(
      userId,
      ApplicationRoles.INACTIVE,
      Roles.GLOBAL_GROUP
    );
  },

  setInactive(userId) {
    if (!this.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Roles.addUsersToRoles(
      userId,
      ApplicationRoles.INACTIVE,
      Roles.GLOBAL_GROUP
    );
    Meteor.users.update(userId, {
      $set: {
        "services.resume.loginTokens": []
      }
    });
  },

  setActive(userId) {
    if (!this.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (this.isActive(userId)) {
      return;
    }
    Roles.removeUsersFromRoles(
      userId,
      ApplicationRoles.INACTIVE,
      Roles.GLOBAL_GROUP
    );
  }
};

if (Meteor.isServer) {
  Accounts.validateLoginAttempt(function(attemptObj) {
    if (attemptObj.user && !Permissions.isActive(attemptObj.user._id)) {
      throw new Meteor.Error(403, "Your account is disabled.");
    }
    if (!attemptObj.user) {
      return false;
    }
    if (Permissions.isAdmin(attemptObj.user._id)) {
      return true;
    }

    if (attemptObj.user.emails[0].verified === true) {
      return true;
    }
    throw new Meteor.Error(
      "email-not-verified",
      "You must verify your email address before you can log in"
    );
  });
}

export const checkLoggedIn = () => {
  if (!Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
};

export const checkCanReadProject = (projectId) => {
  Meteor.call("permissions.canReadProject", { projectId });
};

export const checkCanWriteProject = (projectId) => {
  Meteor.call("permissions.canWriteProject", { projectId });
};

export const checkCanDeleteProject = (projectId) => {
  Meteor.call("permissions.canDeleteProject", { projectId });
};

export const checkCanReadTask = (taskId) => {
  Meteor.call("permissions.canReadTask", { taskId });
};

export const checkCanWriteTask = (taskId) => {
  Meteor.call("permissions.canWriteTask", { taskId });
};

export const checkCanDeleteTask = (taskId) => {
  Meteor.call("permissions.canDeleteTask", { taskId });
};
Permissions.methods = {};

Permissions.methods.setAdmin = new ValidatedMethod({
  name: "permissions.setAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true }
  }).validator(),
  run({ userId, scope }) {
    checkLoggedIn();

    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    Permissions.setAdmin(userId, scope);
  }
});

Permissions.methods.initializeProjectPermissions = new ValidatedMethod({
  name: "permissions.initializeProjectPermissions",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();

    const project = Projects.findOne({ _id: projectId });
    const userId = project.createdBy;
    if (!userId) return;
    Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, projectId);
  }
});

Permissions.methods.initializeOrganizationPermissions = new ValidatedMethod({
  name: "permissions.initializeOrganizationPermissions",
  validate: new SimpleSchema({
    organizationId: { type: String }
  }).validator(),
  run({ organizationId }) {
    checkLoggedIn();

    const organization = Organizations.findOne({ _id: organizationId });
    const userId = organization.createdBy;
    if (!userId) return;
    Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, organizationId);
  }
});

Permissions.methods.removeAdmin = new ValidatedMethod({
  name: "permissions.removeAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true }
  }).validator(),
  run({ userId, scope }) {
    checkLoggedIn();

    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    Permissions.removeAdmin(userId, scope);
  }
});
