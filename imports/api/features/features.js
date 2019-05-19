import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Features = new Mongo.Collection("features");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Features.rawCollection().createIndex({ objectId: 1, name: 1 }, {unique: true});
  });
}

// No client should modify this collection
Features.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
