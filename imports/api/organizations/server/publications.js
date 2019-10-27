import { Meteor } from "meteor/meteor";
import { Permissions, checkLoggedIn } from "/imports/api/permissions/permissions";
import { check, Match } from "meteor/check";

import { Organizations } from "../organizations";

Meteor.publish("organizations", function organizations(name, organizationId) {
  check(name, Match.Maybe(String));
  check(organizationId, Match.Maybe(String));
  checkLoggedIn();

  const userId = Meteor.userId();
  const query = {};
  if (!Permissions.isAdmin(Meteor.userId())) {
    query.$or = [{ members: userId }, { isPublic: true }];
  }
  if (organizationId) {
    query._id = organizationId;
  }
  return Organizations.find(query);
});

Meteor.publish("organization", function organization(organizationId) {
  check(organizationId, String);
  checkLoggedIn();
  const query = { _id: organizationId };
  return Organizations.find(query);
});
