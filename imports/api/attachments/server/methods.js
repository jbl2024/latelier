import { Attachments } from "/imports/api/attachments/attachments.js";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

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
        attachmentId: attachmentId
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
      attachments.map(attachment => {
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
      attachments.map(attachment => {
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
  run({ attachmentId, projectId, taskId }) {
    checkLoggedIn();

    // TODO : Implement method
  }
});
