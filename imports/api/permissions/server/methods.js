import SimpleSchema from "simpl-schema";
import { Roles } from "meteor/jbl2024:roles";
import { Log } from "meteor/logging";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Meetings } from "/imports/api/meetings/meetings.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import {
  Permissions,
  checkLoggedIn
} from "/imports/api/permissions/permissions";
import { ProjectStates, Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { UserUtils } from "/imports/api/users/utils";

/**
 * Project
 */

Permissions.methods.canReadProject = new ValidatedMethod({
  name: "permissions.canReadProject",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const project = await Projects.findOneAsync({
      _id: projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

Permissions.methods.canWriteProject = new ValidatedMethod({
  name: "permissions.canWriteProject",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const project = await Projects.findOneAsync({
      _id: projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }],
      state: { $ne: ProjectStates.ARCHIVED }
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

Permissions.methods.canDeleteProject = new ValidatedMethod({
  name: "permissions.canDeleteProject",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const project = await Projects.findOneAsync({
      _id: projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

/**
 * Tasks
 */
Permissions.methods.canReadTask = new ValidatedMethod({
  name: "permissions.canReadTask",
  validate: new SimpleSchema({
    taskId: { type: String }
  }).validator(),
  async run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = await Projects.findOneAsync({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

Permissions.methods.canWriteTask = new ValidatedMethod({
  name: "permissions.canWriteTask",
  validate: new SimpleSchema({
    taskId: { type: String }
  }).validator(),
  async run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = await Projects.findOneAsync({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }],
      state: { $ne: ProjectStates.ARCHIVED }
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

Permissions.methods.canDeleteTask = new ValidatedMethod({
  name: "permissions.canDeleteTask",
  validate: new SimpleSchema({
    taskId: { type: String }
  }).validator(),
  async run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = await Projects.findOneAsync({
      _id: task.projectId,
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }],
      state: { $ne: ProjectStates.ARCHIVED }
    });
    if (project) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});

/**
 * Attachents
 */

Permissions.methods.canReadAttachment = new ValidatedMethod({
  name: "permissions.canReadAttachment",
  validate: new SimpleSchema({
    attachmentId: { type: String }
  }).validator(),
  async run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.callAsync("permissions.canReadProject", { projectId });
  }
});

Permissions.methods.canWriteAttachment = new ValidatedMethod({
  name: "permissions.canWriteAttachment",
  validate: new SimpleSchema({
    attachmentId: { type: String }
  }).validator(),
  async run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.callAsync("permissions.canWriteProject", { projectId });
  }
});

Permissions.methods.canDeleteAttachment = new ValidatedMethod({
  name: "permissions.canDeleteAttachment",
  validate: new SimpleSchema({
    attachmentId: { type: String }
  }).validator(),
  async run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.callAsync("permissions.canWriteProject", { projectId });
  }
});

/** Meetings * */

Permissions.methods.canReadMeeting = new ValidatedMethod({
  name: "permissions.canReadMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const meeting = await Meetings.findOne({
      _id: meetingId,
      deleted: { $ne: true }
    });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }

    return Meteor.callAsync("permissions.canReadProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.canWriteMeeting = new ValidatedMethod({
  name: "permissions.canWriteMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const meeting = await Meetings.findOneAsync({
      _id: meetingId,
      deleted: { $ne: true }
    });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    return Meteor.callAsync("permissions.canWriteProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.canDeleteMeeting = new ValidatedMethod({
  name: "permissions.canDeleteMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }

    const meeting = await Meetings.findOneAsync({
      _id: meetingId,
      createdBy: userId
    });
    if (!meeting) {
      throw new Meteor.Error("not-authorized");
    }
    return Meteor.callAsync("permissions.canWriteProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.setAdminIfNeeded = new ValidatedMethod({
  name: "permissions.setAdminIfNeeded",
  validate: null,
  async run() {
    checkLoggedIn();
    const user = await Meteor.user();
    const admin = Meteor.settings.roles?.admin || [];
    // eslint-disable-next-line no-restricted-syntax
    for (const email of admin) {
      if (UserUtils.getEmail(user) === email) {
        // eslint-disable-next-line no-await-in-loop
        if (!await Permissions.isAdmin(user._id)) {
          Log.info(`Adding ${UserUtils.getEmail(user)} to admin role`);
          // eslint-disable-next-line no-await-in-loop
          await Roles.addUsersToRolesAsync(user._id, "admin", Roles.GLOBAL_GROUP);
        }
      }
    }
  }
});

Permissions.methods.canReadOrganization = new ValidatedMethod({
  name: "permissions.canReadOrganization",
  validate: new SimpleSchema({
    organizationId: { type: String }
  }).validator(),
  async run({ organizationId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (await Permissions.isAdmin(userId)) {
      return true;
    }
    const organization = await Organizations.findOneAsync({
      _id: organizationId,
      $or: [{ createdBy: userId }, { members: userId }]
    });
    if (organization) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});
