import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";

const ApplicationRoles = Object.freeze({
  ADMIN: "admin",
  INACTIVE: "inactive"
});

export const PermissionObjects = Object.freeze({
  MEETING: "meeting",
  PROJECT: "project",
  TASK: "task"
});

// Provide ddp auth
export const runAsUser = function runAsUser(userId, func) {
  const { DDPCommon } = Package["ddp-common"];
  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId: userId,
    setUserId: () => { },
    unblock: () => { },
    connection: {},
    randomSeed: Random.id()
  });
  return DDP._CurrentInvocation.withValue(invocation, () => func());
};

export const Permissions = {
  isAdmin(userId, scope = Roles.GLOBAL_GROUP) {
    if (!userId) {
      return false;
    }
    return Roles.userIsInRole(userId, ApplicationRoles.ADMIN, scope);
  },

  async setAdmin(userId, scope = Roles.GLOBAL_GROUP) {
    let accessGranted = false;
    if (this.isAdmin(Meteor.userId())) {
      accessGranted = true;
    } else if (this.isAdmin(Meteor.userId(), scope)) {
      accessGranted = true;
    }
    if (!accessGranted) {
      throw new Meteor.Error(401, "not-authorized");
    }
    await Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, scope);
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

    if (
      !Meteor.settings.public.emailVerificationNeeded
      || attemptObj.user.emails[0].verified === true
    ) {
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

export const checkAdmin = (scope) => {
  if (!Permissions.isAdmin(Meteor.userId(), scope)) {
    throw new Meteor.Error("not-authorized");
  }
};

export const checkCanReadProject = async (projectId) => {
  await Meteor.callAsync("permissions.canReadProject", { projectId });
};

export const checkCanWriteProject = async (projectId) => {
  await Meteor.callAsync("permissions.canWriteProject", { projectId });
};

export const checkCanReadOrganization = async (organizationId) => {
  await Meteor.callAsync("permissions.canReadOrganization", { organizationId });
};

export const checkCanDeleteProject = async (projectId) => {
  await Meteor.callAsync("permissions.canDeleteProject", { projectId });
};

export const checkCanReadTask = async (taskId) => {
  await Meteor.callAsync("permissions.canReadTask", { taskId });
};

export const checkCanWriteTask = async (taskId) => {
  await Meteor.callAsync("permissions.canWriteTask", { taskId });
};

export const checkCanDeleteTask = async (taskId) => {
  await Meteor.callAsync("permissions.canDeleteTask", { taskId });
};

/** Meetings * */

export const checkCanReadMeeting = async (meetingId) => {
  await Meteor.callAsync("permissions.canReadMeeting", { meetingId });
};

export const checkCanWriteMeeting = async (meetingId) => {
  await Meteor.callAsync("permissions.canWriteMeeting", { meetingId });
};

export const checkCanDeleteMeeting = async (meetingId) => {
  await Meteor.callAsync("permissions.canDeleteMeeting", { meetingId });
};

/** Generic permissions * */

export const checkCanWriteObject = async (scope, objectId) => {
  switch (scope) {
    case PermissionObjects.MEETING:
      return checkCanWriteMeeting(objectId);
    case PermissionObjects.PROJECT:
      return checkCanWriteProject(objectId);
    case PermissionObjects.TASK:
      return checkCanWriteTask(objectId);
    default:
      throw new Meteor.Error(401, "not-authorized");
  }
};

Permissions.methods = {};

Permissions.methods.setAdmin = new ValidatedMethod({
  name: "permissions.setAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true }
  }).validator(),
  async run({ userId, scope }) {
    checkLoggedIn();

    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    await Permissions.setAdmin(userId, scope);
  }
});

Permissions.methods.initializeProjectPermissions = new ValidatedMethod({
  name: "permissions.initializeProjectPermissions",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();

    const project = await Projects.findOneAsync({ _id: projectId });
    const userId = project.createdBy;
    if (!userId) return;
    await Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, projectId);
  }
});

Permissions.methods.initializeOrganizationPermissions = new ValidatedMethod({
  name: "permissions.initializeOrganizationPermissions",
  validate: new SimpleSchema({
    organizationId: { type: String }
  }).validator(),
  async run({ organizationId }) {
    checkLoggedIn();

    const organization = await Organizations.findOneAsync({ _id: organizationId });
    const userId = organization.createdBy;
    if (!userId) return;
    await Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, organizationId);
  }
});

Permissions.methods.removeAdmin = new ValidatedMethod({
  name: "permissions.removeAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true }
  }).validator(),
  async run({ userId, scope }) {
    checkLoggedIn();

    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    await Permissions.removeAdmin(userId, scope);
  }
});
