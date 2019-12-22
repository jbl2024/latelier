import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import ActivitySchema from "./schema";

export const Activities = new Mongo.Collection("workshop_activities");
Activities.attachSchema(ActivitySchema);
Activities.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
  });
}
