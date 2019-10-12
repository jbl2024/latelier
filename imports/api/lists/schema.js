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
  },

  autoCompleted: {
    type: Boolean,
    optional: true
  },

  catchCompleted: {
    type: Boolean,
    optional: true
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String,

});
