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

export const ActionSchema = {
  actionId: {
    type: String
  },
  type: {
    type: String,
    optional: true,
    defaultValue: "action"
  },
  description: {
    type: String,
    optional: true
  },
  dueDate: {
    type: Date,
    optional: true
  },
  assignedTo: {
    type: String,
    optional: true
  },
  taskId: {
    type: String,
    optional: true
  }
};

export const ActionCreateUpdateSchema = (() => {
  let actionSchema = new SimpleSchema(ActionSchema);
  actionSchema = actionSchema.omit("dueDate");
  actionSchema.extend({
    dueDate: {
      type: String,
      optional: true
    }
  });
  return actionSchema;
})();

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
    defaultValue: "#3f51b5" // indigo
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
  actions: {
    type: Array,
    optional: true
  },
  "actions.$": new SimpleSchema(ActionSchema),
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
  "documents.$": new SimpleSchema(DocumentSchema),
  actions: {
    type: Array,
    optional: true
  },
  "actions.$": new SimpleSchema(ActionCreateUpdateSchema)
}))();


export const MeetingUpdateSchema = (() => {
  const updateSchema = MeetingCreateSchema.omit("projectId");
  updateSchema.extend({
    id: { type: String }
  });
  return updateSchema;
})();
