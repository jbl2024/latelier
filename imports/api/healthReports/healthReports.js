import { Log } from "meteor/logging";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import HealthReportSchema from "./schema";

export const HealthReports = new Mongo.Collection("healthReports");
HealthReports.attachSchema(HealthReportSchema);
HealthReports.methods = {};

if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      await HealthReports.createIndex({ projectId: 1 });
    } catch (error) {
      Log.error("Failed to create index on HealthReports:", error);
    }
  });
}
