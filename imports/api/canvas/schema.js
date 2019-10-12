import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  /* relations */
  projectId: {
    type: String,
  },

  /* main attributes */
  data: {
    type: Object,
    blackbox: true
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
