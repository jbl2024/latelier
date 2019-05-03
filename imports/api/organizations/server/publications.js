import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";
import { Permissions } from "/imports/api/permissions/permissions"


import { Organizations } from "../organizations";

Meteor.publish("organizations", function organizations(name, organizationId) {
  var userId = Meteor.userId();
  let query = {};
  if (!Permissions.isAdmin(Meteor.userId())) {
    query['$or'] = [{members: userId}, {isPublic: true}];
  }
  if (organizationId) {
    query['_id'] = organizationId;
  }
  return Organizations.find(query);
});


Meteor.publish("organization", function organization(organizationId) {
  var userId = Meteor.userId();
  var query = {_id: organizationId};
  return Organizations.find(query);
});
