import { Notifications } from "/imports/api/notifications/notifications.js";

Notifications.methods.insert = new ValidatedMethod({
  name: "notifications.insert",
  validate: new SimpleSchema({
    userId: { type: String },
    type: { type: String },
    data: { type: Object },
  }).validator(),
  run({ userId, type, data }) {
   
    const notificationId = Notifications.insert({
      userId: userId,
      type: type,
      createdAt: new Date(),
    });

    return notificationId;
  }
});