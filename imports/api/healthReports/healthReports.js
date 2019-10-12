import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import HealthReportSchema from "./schema";

import {
  checkLoggedIn,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

import moment from "moment";

export const HealthReports = new Mongo.Collection("healthReports");
HealthReports.attachSchema(HealthReportSchema);
HealthReports.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    HealthReports.rawCollection().createIndex({ projectId: 1 });
  });
}


HealthReports.methods.create = new ValidatedMethod({
  name: "healthReports.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: { type: String },
    date: { type: String },
    weather: { type: String },
  }).validator(),
  run({ projectId, name, description, date, weather }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = HealthReports.insert({
      projectId: projectId,
      name: name,
      description: description,
      date: convertedDate,
      weather: weather,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return reportId;
  }
});

HealthReports.methods.update = new ValidatedMethod({
  name: "healthReports.update",
  validate: new SimpleSchema({
    id: { type: String },
    name: { type: String },
    description: { type: String },
    date: { type: String },
    weather: { type: String },
  }).validator(),
  run({ id, name, description, date, weather }) {
    checkLoggedIn();

    const report = HealthReports.findOne({_id: id});
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(report.projectId);
    
    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = HealthReports.update(
      {
        _id: id
      },
      {
        $set: {
          name: name,
          description: description,
          date: convertedDate,
          weather: weather,
          createdAt: new Date(),
          createdBy: Meteor.userId()
        }
      }
    );

    return reportId;
  }
});

HealthReports.methods.remove = new ValidatedMethod({
  name: "healthReports.remove",
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run({ id }) {
    checkLoggedIn();

    const report = HealthReports.findOne({_id: id});
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(report.projectId);
    HealthReports.remove(id);
  }
});
