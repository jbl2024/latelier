import fs from "fs";
import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { Attachments } from "/imports/api/attachments/attachments";
import { AttachmentsFindSchema } from "/imports/api/attachments/schema";
import { checkCanWriteTask, checkLoggedIn } from "/imports/api/permissions/permissions";

Attachments.methods.remove = new ValidatedMethod({
  name: "attachments.remove",
  validate: new SimpleSchema({
    attachmentId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    taskId: { type: String, optional: true }
  }).validator(),
  async run({ attachmentId, projectId, taskId }) {
    checkLoggedIn();
    if (attachmentId) {
      const canRemove = Meteor.callAsync("permissions.canDeleteAttachment", {
        attachmentId
      });
      if (!canRemove) {
        throw new Meteor.Error("not-authorized");
      }
      await Attachments.removeAsync(attachmentId);
    }

    if (projectId) {
      const attachments = Attachments.find({
        "meta.projectId": projectId
      });
      await attachments.forEachAsync(async (attachment) => {
        const canRemove = await Meteor.callAsync("permissions.canDeleteAttachment", {
          attachmentId: attachment._id
        });
        if (!canRemove) {
          throw new Meteor.Error("not-authorized");
        }
        await Attachments.removeAsync(attachment._id);
      });
    }

    if (taskId) {
      const attachments = Attachments.find({ "meta.taskId": taskId });
      await attachments.forEachAsync(async (attachment) => {
        const canRemove = await Meteor.callAsync("permissions.canDeleteAttachment", {
          attachmentId: attachment._id
        });
        if (!canRemove) {
          throw new Meteor.Error("not-authorized");
        }
        await Attachments.removeAsync(attachment._id);
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
  async run() {
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
  async run({ attachmentId, projectId, taskId }) {
    checkLoggedIn();
    checkCanWriteTask(taskId);

    const attachment = await Attachments.findOneAsync({ _id: attachmentId });
    const userId = Meteor.userId();
    const data = await fs.promises.readFile(attachment.path);
    await Attachments.writeAsync(
      data,
      {
        fileName: attachment.name,
        type: attachment.type,
        meta: {
          projectId,
          taskId,
          createdBy: userId
        }
      }
    );
  }
});

Attachments.methods.find = new ValidatedMethod({
  name: "attachments.find",
  validate: AttachmentsFindSchema.validator(),
  async run({ meta, name, userId, page, perPage, attachmentsIds }) {
    checkLoggedIn();
    page = page || 1;
    perPage = perPage || 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const query = {};
    if (meta === Object(meta)) {
      Object.keys(meta).forEach((key) => {
        if (meta[key]) {
          query[`meta.${key}`] = meta[key];
        }
      });
    }
    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (userId) {
      query.userId = userId;
    }

    if (attachmentsIds && Array.isArray(attachmentsIds) && attachmentsIds.length) {
      query._id = { $in: attachmentsIds };
    }

    const count = await Attachments.find(query).countAsync();
    const data = await Attachments.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetchAsync();
    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});
