import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import ProjectSchema from "./schema";

export const Projects = new Mongo.Collection("projects");
Projects.attachSchema(ProjectSchema);
Projects.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Projects.rawCollection().createIndex({ organizationId: 1 });
    Projects.rawCollection().createIndex({ deleted: 1 });
    Projects.rawCollection().createIndex({ state: 1 });
  });
}

export const ProjectStates = Object.freeze({
  PLANNED: "planned",
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  ARCHIVED: "archived",
  IMPORTING: "importing",
  ERROR: "error"
});

export const ProjectVisibleStates = Object.entries(ProjectStates).reduce((projectStates, entry) => {
  [key, value] = entry;
  if (!["IMPORTING", "ERROR"].includes(key)) {
    projectStates[key] = value;
  }
  return projectStates;
}, {});

export const ProjectAccessRights = Object.freeze({
  ORGANIZATION: "organization",
  PRIVATE: "private"
});

export const ProjectExportVersions = Object.freeze({
  V2020_11: "V2020_11"
});
