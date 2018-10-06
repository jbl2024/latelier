import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Resources } from "../resources";

Meteor.publish("resources", function resources(organizationId) {
  var userId = Meteor.userId();
  var query = {organizationId: organizationId};
  return Resources.find(query);
});


Meteor.publish("resource", function resource(id) {
  var userId = Meteor.userId();
  var query = { _id: id };
  return Resources.find(query);
});
