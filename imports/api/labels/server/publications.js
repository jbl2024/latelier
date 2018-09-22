import { Meteor } from "meteor/meteor";

import { Labels } from "../labels";

Meteor.publish("labels", function labels(projectId, name) {
  var userId = Meteor.userId();
  var query = {projectId: projectId};
  if (name && name.length > 0) {
    query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
  } 
  return Labels.find(query);
});
