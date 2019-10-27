import { Meteor } from "meteor/meteor";
import { Attachments } from "/imports/api/attachments/attachments";
import { checkLoggedIn, checkCanWriteTask } from "/imports/api/permissions/permissions";
import fs from "fs";

const bound = Meteor.bindEnvironment((callback) => callback());

Attachments.methods.remove = new ValidatedMethod({
  name: "attachments.remove",
  validate: new SimpleSchema({
    attachmentId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    taskId: { type: String, optional: true }
  }).validator(),
  run({ attachmentId, projectId, taskId }) {
    checkLoggedIn();

    if (attachmentId) {
      const canRemove = Meteor.call("permissions.canDeleteAttachment", {
        attachmentId
      });
      if (!canRemove) {
        throw new Meteor.Error("not-authorized");
      }
      Attachments.remove(attachmentId);
    }

    if (projectId) {
      const attachments = Attachments.find({
        "meta.projectId": projectId
      }).fetch();
      attachments.forEach((attachment) => {
        const canRemove = Meteor.call("permissions.canDeleteAttachment", {
          attachmentId: attachment._id
        });
        if (!canRemove) {
          throw new Meteor.Error("not-authorized");
        }
        Attachments.remove(attachment._id);
      });
    }

    if (taskId) {
      const attachments = Attachments.find({ "meta.taskId": taskId }).fetch();
      attachments.forEach((attachment) => {
        const canRemove = Meteor.call("permissions.canDeleteAttachment", {
          attachmentId: attachment._id
        });
        if (!canRemove) {
          throw new Meteor.Error("not-authorized");
        }
        Attachments.remove(attachment._id);
      });
    }
  }
});

Attachments.methods.restore = new ValidatedMethod({
  name: "attachments.restore",
  validate: new SimpleSchema({
    attachmentId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    taskId: { type: String, optional: true }
  }).validator(),
  run() {
    checkLoggedIn();

    // TODO : Implement method
  }
});

Attachments.methods.clone = new ValidatedMethod({
  name: "attachments.clone",
  validate: new SimpleSchema({
    attachmentId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    taskId: { type: String, optional: true }
  }).validator(),
  run({ attachmentId, projectId, taskId }) {
    checkLoggedIn();
    checkCanWriteTask(taskId);

    const attachment = Attachments.findOne({ _id: attachmentId });
    const userId = Meteor.userId();
    fs.readFile(attachment.path, (error, data) => {
      bound(() => {
        if (error) {
          throw error;
        } else {
          Attachments.write(
            data,
            {
              fileName: attachment.name,
              type: attachment.type,
              meta: {
                projectId,
                taskId,
                createdBy: userId
              }
            },
            (writeError) => {
              if (writeError) {
                throw writeError;
              }
            }
          );
        }
      });
    });
  }
});
