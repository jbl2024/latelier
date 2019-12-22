import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* main attributes */
  name: String,
  description: {
    type: String,
    optional: true
  },

  deleted: {
    type: Boolean,
    defaultValue: false
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
