import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Coeditions } from "../coeditions";
import { checkCanWriteObject } from "/imports/api/permissions/permissions";

// This code only runs on the server
Meteor.publish("coeditions", function coeditions(objectId, permissionObject, permissionId) {
  check(objectId, String);
  check(permissionObject, String);
  check(permissionId, String);
  checkCanWriteObject(permissionObject, permissionId);
  return Coeditions.find({ objectId: objectId }, { sort: { version: -1 }, limit: 1 });
});
