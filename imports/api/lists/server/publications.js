import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Lists } from "../lists";

// This code only runs on the server
Meteor.publish("lists", function listsPublication(projectId) {
  check(projectId, String);
  return Lists.find({ projectId }, { sort: { order: -1 } });
});

Meteor.publish("list", function list(listId) {
  check(listId, String);
  return Lists.find({ _id: listId });
});
