import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  /* relations */
  projectId: String,
  listId: String,
  /* main attributes */
  name: String,
  number: Number,
  order: Number,
  description: {
    type: String,
    optional: true
  },

  /* modification dates */
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  updatedBy: String,

  /* labels */
  labels: {
    type: Array,
    optional: true
  },

  "labels.$": {
    type: String
  },

  /* responsibilities */
  assignedTo: {
    type: String,
    optional: true
  },

  watchers: {
    type: Array,
    optional: true
  },
  "watchers.$": {
    type: String
  },

  /* completed attributes */
  completed: {
    type: Boolean,
    defaultValue: false
  },
  completedAt: {
    type: Date,
    optional: true
  },
  completedBy: {
    type: String,
    optional: true
  },

  /* dates */
  startDate: {
    type: Date,
    optional: true
  },

  dueDate: {
    type: Date,
    optional: true
  },

  reminderDueDate: {
    type: Number,
    optional: true
  },

  reminderStartDate: {
    type: Number,
    optional: true
  },

  /* checklist */
  checklist: {
    type: Array,
    optional: true
  },
  "checklist.$": Object,
  "checklist.$._id": String,
  "checklist.$.createdAt": Date,
  "checklist.$.createdBy": String,
  "checklist.$.name": String,
  "checklist.$.checked": {
    type: Boolean,
    defaultValue: false
  },

  /* notes */
  notes: {
    type: Array,
    optional: true
  },
  "notes.$": Object,
  "notes.$._id": String,
  "notes.$.createdAt": Date,
  "notes.$.createdBy": String,
  "notes.$.content": String,
  "notes.$.edited": {
    type: Boolean,
    defaultValue: false
  },
  "notes.$.editedBy": {
    type: String,
    optional: true
  },
});
