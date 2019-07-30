import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const Notifications = new Mongo.Collection("notifications");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Projects.rawCollection().createIndex({ userId: 1 });
  });
}

export const NotificationTypes = Object.freeze({
  TASK_REMINDER_START_DATE: "task_reminder_start_date",
  TASK_REMINDER_DUE_DATE: "task_reminder_due_date",
});

Notifications.methods = {};
