import SimpleSchema from "simpl-schema";






export const attendees = {
  /* attendees */
  attendees: {
    type: Array,
    optional: true
  },
  "attendees.$": {
    type: Object
  },
  "attendees.$.userId": {
    type: String,
    optional: true
  },
  "attendees.$.firstName": {
    type: String
  },
  "attendees.$.lastName": {
    type: String,
    optional: true
  },
  "attendees.$.email": {
    type: String,
    optional: true
  },
  "attendees.$.present": {
    type: Boolean,
    optional: true
  }
};

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
  ...attendees,
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
