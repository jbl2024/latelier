import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import TaskSchema from "./schema";

export const Tasks = new Mongo.Collection("tasks");
Tasks.attachSchema(TaskSchema);
Tasks.methods = {};
Tasks.helpers = {};

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await Tasks.rawCollection().createIndex({ listId: 1 });
    await Tasks.rawCollection().createIndex({ projectId: 1 });
    await Tasks.rawCollection().createIndex({ deleted: 1 });
    await Tasks.rawCollection().createIndex({ projectId: 1, deleted: 1 });
    await Tasks.rawCollection().createIndex({ completed: 1 });
    await Tasks.rawCollection().createIndex({ completedAt: 1 });
    await Tasks.rawCollection().createIndex({ projectId: 1, listId: 1, order: 1 });
    await Tasks.rawCollection().createIndex({ number: 1 }, { unique: true });
  });
}
