import SimpleSchema from "simpl-schema";
import { Notifications } from "/imports/api/notifications/notifications.js";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

Notifications.methods.create = new ValidatedMethod({
  name: "notifications.create",
  validate: new SimpleSchema({
    userId: { type: String },
    type: { type: String },
    properties: { type: Object, optional: true, blackbox: true }
  }).validator(),
  async run({ userId, type, properties }) {
    const notificationId = await Notifications.insertAsync({
      userId,
      type,
      properties,
      read: false,
      createdAt: new Date()
    });
    await Meteor.callAsync("notifications.updateProfile", { userId });
    await Meteor.callAsync("notifications.purge", { userId });
    return notificationId;
  }
});

Notifications.methods.markAsRead = new ValidatedMethod({
  name: "notifications.markAsRead",
  validate: new SimpleSchema({
    notificationIds: [String]
  }).validator(),
  async run({ notificationIds }) {
    const userId = Meteor.userId();
    notificationIds.forEach(async (id) => {
      await Notifications.updateAsync(
        { _id: id, userId },
        { $set: { read: true } }
      );
    });
    await Meteor.callAsync("notifications.updateProfile", { userId });
  }
});

Notifications.methods.markAllAsRead = new ValidatedMethod({
  name: "notifications.markAllAsRead",
  validate: null,
  async run() {
    const userId = Meteor.userId();
    await Notifications.updateAsync(
      { userId, read: false },
      { $set: { read: true } },
      { multi: true }
    );
    await Meteor.callAsync("notifications.updateProfile", { userId });
  }
});

Notifications.methods.clear = new ValidatedMethod({
  name: "notifications.clear",
  validate: null,
  async run() {
    const userId = Meteor.userId();
    await Notifications.removeAsync({ userId });
    await Meteor.callAsync("notifications.updateProfile", { userId });
  }
});

Notifications.methods.load = new ValidatedMethod({
  name: "notifications.load",
  validate: new SimpleSchema({
    page: { type: Number }
  }).validator(),
  async run({ page }) {
    checkLoggedIn();
    const query = {
      userId: Meteor.userId()
    };

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = await Notifications.find(query).countAsync();
    const data = await Notifications.find(query, {
      skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetchAsync();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Notifications.methods.remove = new ValidatedMethod({
  name: "notifications.remove",
  validate: new SimpleSchema({
    notificationId: { type: String }
  }).validator(),
  async run({ notificationId }) {
    const notification = await Notifications.findOneAsync({ _id: notificationId });
    if (notification.userId !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await Notifications.removeAsync({ _id: notificationId });

    await Meteor.callAsync("notifications.updateProfile", { userId: Meteor.userId() });
  }
});

Notifications.methods.updateProfile = new ValidatedMethod({
  name: "notifications.updateProfile",
  validate: new SimpleSchema({
    userId: { type: String }
  }).validator(),
  async run({ userId }) {
    this.unblock();

    const count = await Notifications.find({ userId, read: false }).countAsync();
    await Meteor.users.updateAsync(userId, { $set: { "notifications.count": count } });
  }
});

Notifications.methods.purge = new ValidatedMethod({
  name: "notifications.purge",
  validate: new SimpleSchema({
    userId: { type: String }
  }).validator(),
  async run({ userId }) {
    this.unblock();

    const count = await Notifications.find({ userId }).countAsync();
    const keep = Meteor.settings.notificationsPerUser || 50;
    if (count > keep) {
      const notifications = await Notifications.find(
        { userId },
        { sort: { createdAt: 1 } }
      ).fetchAsync();
      const toDelete = count - keep;
      for (let i = 0; i < toDelete; i++) {
        // eslint-disable-next-line no-await-in-loop
        await Notifications.removeAsync({ _id: notifications[i]._id });
      }
    }
  }
});
