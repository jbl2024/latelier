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

  color: {
    type: String,
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
