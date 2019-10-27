import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Labels } from "../labels";

Meteor.publish("labels", function labels(projectId, name) {
  check(projectId, String);
  check(name, Match.Maybe(String));
  const query = { projectId };
  if (name && name.length > 0) {
    query.name = { $regex: `.*${name}.*`, $options: "i" };
  }
  return Labels.find(query);
});
