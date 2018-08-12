import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { ProjectGroups } from "../projectGroups";

Meteor.publish("projectGroups", function projectGroups(name) {
  var userId = Meteor.userId();
  var query = {$or: [{createdBy: userId}, {members: userId}]};
  if (name && name.length > 0) {
    query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
  } 
  return ProjectGroups.find(query);
});
