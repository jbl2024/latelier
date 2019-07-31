import { Notifications } from "/imports/api/notifications/notifications.js";
import { Match } from "meteor/check";

Notifications.methods.create = new ValidatedMethod({
  name: "notifications.create",
  validate: new SimpleSchema({
    userId: { type: String },
    type: { type: String },
    properties: { type: Object, optional: true, blackbox: true }
  }).validator(),
  run({ userId, type, properties }) {
    const notificationId = Notifications.insert({
      userId: userId,
      type: type,
      properties: properties,
      createdAt: new Date()
    });

    return notificationId;
  }
});
