import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SessionSchema from "./schema";

export const Workshops = new Mongo.Collection("workshop_workshops");
Workshops.attachSchema(SessionSchema);
Workshops.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Digests.rawCollection().createIndex({ projectId: 1 });
  });
}
