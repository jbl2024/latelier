import SimpleSchema from "simpl-schema";
export default new SimpleSchema({
  /* relations */
  projectId: {
    type: String,
    optional: true
  },
  type: String,
  name: String,
  channel: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: String
});