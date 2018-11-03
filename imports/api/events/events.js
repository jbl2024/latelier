import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

export const Events = new Mongo.Collection('events');

var callbacks = {};
Events.onTrack = function(name, callback) {
  if (! _.isArray(callbacks[name]))
    callbacks[name] = [];

  callbacks[name].push(callback);
};

Meteor.methods({
  'events.track' (event ) {
    check(event, {
      createdAt: Match.Optional(Date),
      name: String,
      description: Match.Optional(String),
      important: Match.Optional(Boolean),
      type: String,
      userId: Match.Optional(String),
      properties: Match.Optional(Object)
    });
  
    event.createdAt = event.createdAt || new Date();
  
    if (_.isArray(callbacks[event.name]))
      _.each(callbacks[event.name], function(cb) {
        cb(event);
      });
  
    Events.insert(event);    
  }
});


