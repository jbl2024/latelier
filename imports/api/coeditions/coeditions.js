import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import CoeditionSchema from "./schema";

export const Coeditions = new Mongo.Collection("coeditions");
Coeditions.attachSchema(CoeditionSchema);
Coeditions.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Coeditions.rawCollection().createIndex({ objectId: 1 });
    Coeditions.rawCollection().createIndex({ createdAt: 1 });
    Coeditions.rawCollection().createIndex({ objectId: 1, version: 1 });
  });
}
