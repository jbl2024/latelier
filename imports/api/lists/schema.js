import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  projectId: {
    type: String
  },

  /* main attributes */
  name: {
    type: String
  },

  order: {
    type: Number,
    optional: true
  },

  autoComplete: {
    type: Boolean,
    defaultValue: false
  },

  catchCompleted: {
    type: Boolean,
    defaultValue: false
  },

  taskCount: {
    type: Number,
    defaultValue: 0
  },

  taskCompletedCount: {
    type: Number,
    defaultValue: 0
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
