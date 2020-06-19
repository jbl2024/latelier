import { FilesCollection } from "meteor/ostrio:files";
import SimpleSchema from "simpl-schema";


export const AttachmentSchema = FilesCollection.schema;


// Picking meta,name,userId from Attachment schema and add page and perPage field to it
export const AttachmentsFindSchema = (() => {
  const attachmentSchema = new SimpleSchema(AttachmentSchema);
  const findSchema = attachmentSchema.pick("meta", "name", "userId");
  findSchema.extend({
    page: {
      type: Number,
      optional: true
    },
    perPage: {
      type: Number,
      optional: true
    }
  });
  return findSchema;
})();

export const AttachmentsUpdateManySchema = (() => {
  const attachmentSchema = new SimpleSchema(AttachmentSchema);
  const updateAttachmentSchema = attachmentSchema.pick("_id", "updatedAt", "meta");
  return new SimpleSchema({
    attachments: {
      type: Array,
      min: 1
    },
    "attachments.$": {
      type: new SimpleSchema(updateAttachmentSchema)
    }
  });
})();