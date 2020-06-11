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
  deleted: {
    type: Boolean,
    defaultValue: false
  },
  state: {
    type: String,
    allowedValues: ["pending", "running", "stopped", "completed", "canceled"]
  },
  color: {
    type: String,
    optional: true,
    defaultValue: "#363636"
  },
  type: {
    type: String,
    optional: true,
    defaultValue: "none"
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
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
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
