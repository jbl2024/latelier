import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import ProjectGroupSchema from "./schema";

export const ProjectGroups = new Mongo.Collection("projectGroups");
ProjectGroups.attachSchema(ProjectGroupSchema);

if (Meteor.isServer) {
  Meteor.startup(() => {
    ProjectGroups.rawCollection().createIndex({ organizationId: 1 });
  });
}
