import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import TrackSchema from "./schema";
// import {
//   checkCanWriteProject
// } from "/imports/api/permissions/permissions";

export const Tracks = new Mongo.Collection("workshops_tracks");
Tracks.attachSchema(TrackSchema);
Tracks.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Tracks.rawCollection().createIndex({ sessionId: 1 });
    Tracks.rawCollection().createIndex({ workshopId: 1 });
    Tracks.rawCollection().createIndex({ activityId: 1 });
  });
}
