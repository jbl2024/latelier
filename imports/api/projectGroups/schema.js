import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  organizationId: {
    type: String
  },

  /* main attributes */
  name: {
    type: String
  },

  properties: {
    type: Object,
    optional: true,
    blackbox: true
  },

  projects: {
    type: Array,
    optional: true
  },

  "projects.$": {
    type: String
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
