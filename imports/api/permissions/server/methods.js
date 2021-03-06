import {
  Permissions,
  checkLoggedIn
} from "/imports/api/permissions/permissions";
import { Projects, ProjectStates } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Meetings } from "/imports/api/meetings/meetings.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Roles } from "meteor/alanning:roles";
import { UserUtils } from "/imports/api/users/utils";

/**
 * Project
 */

Permissions.methods.canReadProject = new ValidatedMethod({
  name: "permissions.canReadProject",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const project = Projects.findOne({
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
  run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const project = Projects.findOne({
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
  run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const project = Projects.findOne({
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
  run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = Projects.findOne({
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
  run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = Projects.findOne({
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
  run({ taskId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      throw new Meteor.Error("not-found");
    }

    const project = Projects.findOne({
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
  run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.call("permissions.canReadProject", { projectId });
  }
});

Permissions.methods.canWriteAttachment = new ValidatedMethod({
  name: "permissions.canWriteAttachment",
  validate: new SimpleSchema({
    attachmentId: { type: String }
  }).validator(),
  run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.call("permissions.canWriteProject", { projectId });
  }
});

Permissions.methods.canDeleteAttachment = new ValidatedMethod({
  name: "permissions.canDeleteAttachment",
  validate: new SimpleSchema({
    attachmentId: { type: String }
  }).validator(),
  run({ attachmentId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const attachment = Attachments.findOne({ _id: attachmentId });
    if (!attachment) {
      return false;
    }
    const { projectId } = attachment.meta;
    return Meteor.call("permissions.canWriteProject", { projectId });
  }
});

/** Meetings * */

Permissions.methods.canReadMeeting = new ValidatedMethod({
  name: "permissions.canReadMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const meeting = Meetings.findOne({
      _id: meetingId,
      deleted: { $ne: true }
    });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }

    return Meteor.call("permissions.canReadProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.canWriteMeeting = new ValidatedMethod({
  name: "permissions.canWriteMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const meeting = Meetings.findOne({
      _id: meetingId,
      deleted: { $ne: true }
    });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    return Meteor.call("permissions.canWriteProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.canDeleteMeeting = new ValidatedMethod({
  name: "permissions.canDeleteMeeting",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }

    const meeting = Meetings.findOne({
      _id: meetingId,
      createdBy: userId
    });
    if (!meeting) {
      throw new Meteor.Error("not-authorized");
    }
    return Meteor.call("permissions.canWriteProject", { projectId: meeting.projectId });
  }
});

Permissions.methods.setAdminIfNeeded = new ValidatedMethod({
  name: "permissions.setAdminIfNeeded",
  validate: null,
  run() {
    this.unblock();

    checkLoggedIn();
    const user = Meteor.user();
    const admin = Meteor.settings.roles?.admin || [];
    admin.forEach((email) => {
      if (UserUtils.getEmail(user) === email) {
        if (!Permissions.isAdmin(user._id)) {
          /* eslint no-console: off */
          console.info(`Adding ${UserUtils.getEmail(user)} to admin role`);
          Roles.addUsersToRoles(user._id, "admin", Roles.GLOBAL_GROUP);
        }
      }
    });
  }
});

Permissions.methods.canReadOrganization = new ValidatedMethod({
  name: "permissions.canReadOrganization",
  validate: new SimpleSchema({
    organizationId: { type: String }
  }).validator(),
  run({ organizationId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    if (Permissions.isAdmin(userId)) {
      return true;
    }
    const organization = Organizations.findOne({
      _id: organizationId,
      $or: [{ createdBy: userId }, { members: userId }]
    });
    if (organization) {
      return true;
    }
    throw new Meteor.Error("not-authorized");
  }
});
