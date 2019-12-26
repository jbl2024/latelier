import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  workshopId: {
    type: String
  },
  projectId: {
    type: String
  },

  /* main attributes */
  name: String,

  order: {
    type: Number,
    optional: true
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
