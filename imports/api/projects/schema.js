import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  /* relations */
  organizationId: {
    type: String,
    optional: true
  },
  projectGroupId: {
    type: String,
    optional: true
  },

  /* main attributes */
  name: String,
  deleted: {
    type: Boolean,
    defaultValue: false
  },
  state: {
    type: String,
    optional: true
  },
  color: {
    type: String,
    optional: true
  },
  isPublic: {
    type: Boolean,
    optional: true
  },
  accessRights: {
    type: String,
    optional: true
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
  },

  /* dates */
  startDate: {
    type: Date,
    optional: true
  },

  endDate: {
    type: Date,
    optional: true
  },

  /* features */
  features: {
    type: Array,
    optional: true
  },
  "features.$": {
    type: String
  }
});
