import { FilesCollection } from "meteor/ostrio:files";
import SimpleSchema from "simpl-schema";


export const AttachmentSchema = FilesCollection.schema;


// Picking meta,name,userId from Attachment schema and add page and perPage field to it
export const AttachmentsFindSchema = (() => {
  const attachmentSchema = new SimpleSchema(AttachmentSchema);
  const findSchema = attachmentSchema.pick("meta", "userId");
  findSchema.extend({
    name: {
      type: String,
      optional: true
    },
    page: {
      type: Number,
      optional: true
    },
    perPage: {
      type: Number,
      optional: true
    },
    attachmentsIds: {
      type: Array,
      optional: true,
      min: 1
    },
    "attachmentsIds.$": {
      type: String
    }
  });
  return findSchema;
})();
