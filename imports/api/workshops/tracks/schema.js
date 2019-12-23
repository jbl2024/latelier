import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  workshopId: String,
  sessionId: {
    type: String,
    optional: true
  },
  activityId: {
    type: String
  },
  /* main attributes */
  name: String,
  description: {
    type: String,
    optional: true
  },
  order: Number,

  deleted: {
    type: Boolean,
    defaultValue: false
  },

  /* modification dates */
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  updatedBy: String
});
