import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* main attributes */
  name: {
    type: String
  },

  description: {
    type: String,
    optional: true
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String,

  /* members */
  members: {
    type: Array,
    optional: true
  },
  "members.$": {
    type: String
  }
});
