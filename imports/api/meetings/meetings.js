import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import MeetingSchema from "./schema";

export const MeetingState = Object.freeze({
  PENDING: "pending",
  RUNNING: "running",
  STOPPED: "stopped",
  COMPLETED: "completed",
  CANCELED: "canceled"
});

export const MeetingRoles = Object.freeze({
  ORGANIZER: "organizer",
  ATTENDEE: "attendee"
});

export const Meetings = new Mongo.Collection("meetings");
Meetings.attachSchema(MeetingSchema);
Meetings.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Meetings.rawCollection().createIndex({ projectId: 1 });
  });
}
