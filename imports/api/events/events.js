import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { callbacks } from "./notifications";

export const Events = new Mongo.Collection("events");

if (Meteor.isServer) {
  Meteor.methods({
    "events.track"(event) {
      check(event, {
        createdAt: Match.Optional(Date),
        type: String,
        important: Match.Optional(Boolean),
        userId: Match.Optional(String),
        properties: Match.Optional(Object)
      });

      event.createdAt = event.createdAt || new Date();
      event.userId = event.userId || Meteor.userId();

      Events.insert(event);

      if (callbacks[event.type] && Array.isArray(callbacks[event.type])) {
        callbacks[event.type].map(cb => {
          cb(event);
        });
      } else if (callbacks[event.type]) {
        callbacks[event.type](event);
      }
    },

    "events.removeProject"(projectId) {
      this.unblock();

      check(projectId, String);
      Events.remove({"properties.task.project._id": projectId});
    }
  });
}