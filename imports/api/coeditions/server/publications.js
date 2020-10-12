import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Coeditions } from "../coeditions";

// This code only runs on the server
Meteor.publish("coeditions", function coeditions(objectId) {
  check(objectId, String);
  return Coeditions.find({ objectId: objectId }, { sort: { version: -1 }, limit: 1 });
});
