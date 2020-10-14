import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  objectId: {
    type: String
  },
  version: {
    type: Number
  },
  doc: {
    type: String,
    optional: true
  },
  steps: {
    type: String,
    optional: true
  },
  createdAt: Date
});
