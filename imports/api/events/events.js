import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

export const Events = new Mongo.Collection('events');

var callbacks = {};
Events.onTrack = function(name, callback) {
  if (! callbacks[name].isArray())
    callbacks[name] = [];

  callbacks[name].push(callback);
};

Meteor.methods({
  'events.track' (event ) {
    check(event, {
      createdAt: Match.Optional(Date),
      type: String,
      important: Match.Optional(Boolean),
      userId: Match.Optional(String),
      properties: Match.Optional(Object)
    });
  
    event.createdAt = event.createdAt || new Date();
    event.userId = event.userId || Meteor.userId();
  
    if (callbacks[event.name] && callbacks[event.name].isArray())
      callbacks[event.name].map(cb => {
        cb(event);
      });
  
    Events.insert(event);    
  }
});


