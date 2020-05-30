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

  state: {
    type: String,
    allowedValues: ["pending", "running", "completed", "canceled"]
  },

  /* attendees */
  attendees: {
    type: Array,
    optional: true
  },
  "attendees.$": Object,
  "attendees.$.name": String,
  "attendees.$.present": {
    type: Boolean,
    optional: true
  },

  description: {
    type: String,
    optional: true
  },

  schedule: {
    type: Date,
    optional: true
  },

  subject: {
    type: String,
    optional: true
  },
  agenda: {
    type: String,
    optional: true
  },

  report: {
    type: String,
    optional: true
  },

  scheduleSlots: {
    type: Array,
    optional: true
  },
  "scheduleSlots.$": Object,
  "scheduleSlots.$.start": Date,
  "scheduleSlots.$.end": Date,

  /* creation dates */
  createdAt: Date,
  createdBy: String,

  /* update dates */
  updatedAt: Date,
  updatedBy: String
});
