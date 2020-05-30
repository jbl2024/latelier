import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import MeetingSchema from "./schema";

export const Meetings = new Mongo.Collection("meetings");
Meetings.attachSchema(MeetingSchema);
Meetings.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Meetings.rawCollection().createIndex({ projectId: 1 });
  });
}
