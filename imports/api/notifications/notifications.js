import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Notifications = new Mongo.Collection("notifications");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Notifications.rawCollection().createIndex({ userId: 1 });
  });
}

export const NotificationTypes = Object.freeze({
  TASK_REMINDER_START_DATE: "tasks.reminderStartDate",
  TASK_REMINDER_DUE_DATE: "tasks.reminderDueDate",
});

Notifications.methods = {};
