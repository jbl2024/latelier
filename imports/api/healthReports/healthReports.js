import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import HealthReportSchema from "./schema";

export const HealthReports = new Mongo.Collection("healthReports");
HealthReports.attachSchema(HealthReportSchema);
HealthReports.methods = {};

export const HealthReportsWeathers = Object.freeze([
  "sunny",
  "cloudy",
  "storm"
]);

if (Meteor.isServer) {
  Meteor.startup(() => {
    HealthReports.rawCollection().createIndex({ projectId: 1 });
  });
}
