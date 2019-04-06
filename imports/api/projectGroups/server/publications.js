import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { ProjectGroups } from "../projectGroups";

Meteor.publish("projectGroups", function projectGroups(organizationId, name) {
  var userId = Meteor.userId();
  var query = {};
  if (name && name.length > 0) {
    query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
  } 
  if (organizationId) {
    query.organizationId = organizationId;
  }
  return ProjectGroups.find(query);
});
