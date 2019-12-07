import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import DigestSchema from "./schema";

export const Digests = new Mongo.Collection("digests");
Digests.attachSchema(DigestSchema);
DigestSchema.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Digests.rawCollection().createIndex({ type: 1 });
    Digests.rawCollection().createIndex({ when: 1 });
    Digests.rawCollection().createIndex({ taskId: 1 });
    Digests.rawCollection().createIndex({ projectId: 1 });
  });
}
