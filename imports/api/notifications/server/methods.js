import { Notifications } from "/imports/api/notifications/notifications.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

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
      read: false,
      createdAt: new Date()
    });
    Meteor.call("notifications.updateProfile", {userId: userId});

    return notificationId;
  }
});


Notifications.methods.markAsRead = new ValidatedMethod({
  name: "notifications.markAsRead",
  validate: new SimpleSchema({
    notificationIds: { type: [String] },
  }).validator(),
  run({ notificationIds }) {
    const userId = Meteor.userId();
    notificationIds.map(id => {
      Notifications.update({_id: id, userId: userId}, {$set: {read: true}});
    });
    Meteor.call("notifications.updateProfile", {userId: userId});
  }
});

Notifications.methods.load = new ValidatedMethod({
  name: "notifications.load",
  validate: new SimpleSchema({
    page: { type: Number }
  }).validator(),
  run({ page }) {
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

    const count = Notifications.find(query).count();
    const data = Notifications.find(query, {
      skip: skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  }
});

Notifications.methods.remove = new ValidatedMethod({
  name: "notifications.remove",
  validate: new SimpleSchema({
    notificationId: { type: String }
  }).validator(),
  run({ notificationId }) {
    const notification = Notifications.findOne({ _id: notificationId });
    if (notification.userId !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Notifications.remove({ _id: notificationId });

    Meteor.call("notifications.updateProfile", {userId: Meteor.userId()});
  }
});

Notifications.methods.updateProfile = new ValidatedMethod({
  name: "notifications.updateProfile",
  validate: new SimpleSchema({
    userId: { type: String }
  }).validator(),
  run({ userId }) {
    this.unblock();

    const count = Notifications.find({userId: userId, read: false}).count()
    Meteor.users.update(userId, {$set: {'notifications.count': count}})
  }
});
