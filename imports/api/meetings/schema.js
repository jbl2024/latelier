import SimpleSchema from "simpl-schema";

export const DocumentSchema = {
  documentId: {
    type: String
  },
  name: {
    type: String
  },
  type: {
    type: String
  },
  userId: {
    type: String,
    optional: true
  },
  storageType: {
    type: String,
    optional: true,
    defaultValue: "attachments"
  }
};

export const AttendeeSchema = {
  attendeeId: {
    type: String
  },
  userId: {
    type: String,
    optional: true
  },
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  },
  role: {
    type: String,
    optional: true,
    defaultValue: "attendee"
  },
  email: {
    type: String,
    optional: true
  },
  present: {
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
  attendees: {
    type: Array,
    optional: true
  },
  "attendees.$": new SimpleSchema(AttendeeSchema),
  documents: {
    type: Array,
    optional: true
  },
  "documents.$": new SimpleSchema(DocumentSchema),
  report: {
    type: String,
    optional: true
  },
  /* creation dates */
  createdAt: Date,
  createdBy: String,

  /* update dates */
  updatedAt: Date,
  updatedBy: String
});

export const MeetingCreateSchema = (() => new SimpleSchema({
  projectId: { type: String },
  name: { type: String },
  state: { type: String, optional: true },
  description: { type: String, optional: true },
  agenda: { type: String, optional: true },
  color: { type: String, optional: true },
  location: { type: String, optional: true },
  type: { type: String, optional: true },
  startDate: { type: String },
  endDate: { type: String },
  attendees: {
    type: Array,
    optional: true
  },
  "attendees.$": {
    type: new SimpleSchema(AttendeeSchema)
  },
  documents: {
    type: Array,
    optional: true
  },
  "documents.$": new SimpleSchema(DocumentSchema)
}))();


export const MeetingUpdateSchema = (() => {
  const updateSchema = MeetingCreateSchema.omit("projectId");
  updateSchema.extend({
    id: { type: String }
  });
  return updateSchema;
})();
