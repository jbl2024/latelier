import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  /* relations */
  projectId: {
    type: String,
  },

  /* main attributes */
  name: {
    type: String,
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

  /* creation dates */
  createdAt: Date,
  createdBy: String,

});
