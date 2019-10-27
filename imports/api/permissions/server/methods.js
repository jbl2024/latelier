import {
  Permissions,
  checkLoggedIn
} from "/imports/api/permissions/permissions";
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments.js";

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
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
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
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
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
      $or: [{ createdBy: userId }, { members: userId }, { isPublic: true }]
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
