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

  description: {
    type: String,
    optional: true
  },

  date: {
    type: Date
  },

  weather: {
    type: String
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
