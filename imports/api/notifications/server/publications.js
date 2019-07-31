import { Meteor } from "meteor/meteor";

import { Notifications } from "../notifications";
import { Tasks } from "/imports/api/tasks/tasks";

Meteor.publish("notifications", function notifications() {
  const userId = Meteor.userId();
  const query = { userId: userId };

  const transform = data => {
    const properties = data.properties;
    if (properties.taskId) {
      const task = Tasks.findOne({ _id: properties.taskId });
      data.task = task;
    }
    return data;
  };

  const observer = Notifications.find(query, {
    limit: 25,
    sort: {
      createdAt: -1
    }
  }).observeChanges({
    added: (id, fields) => {
      fields = transform(fields);
      this.added("notifications", id, fields);
    },
    changed: (id, fields) => {
      fields = transform(fields);
      this.changed("notifications", id, fields);
    },
    removed: id => {
      this.removed("notifications", id);
    }
  });
  this.ready();
  this.onStop(() => {
    observer.stop();
  });
});
