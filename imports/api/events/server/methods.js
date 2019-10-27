import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Events } from "../events";
import { callbacks as mailsCB } from "./mails";
import { callbacks as remindersCB } from "./reminders";
import { callbacks as notificationsCB } from "./notifications";

const callbacks = [mailsCB, remindersCB, notificationsCB];

Meteor.methods({
  "events.track"(event) {
    check(event, {
      createdAt: Match.Optional(Date),
      type: String,
      important: Match.Optional(Boolean),
      userId: Match.Optional(String),
      properties: Match.Optional(Object)
    });

    event.createdAt = event.createdAt || new Date();
    event.userId = event.userId || Meteor.userId();

    Events.insert(event);

    callbacks.forEach((cb) => {
      if (cb[event.type]) {
        cb[event.type](event);
      }
      if (cb["*"]) {
        cb["*"](event);
      }
    });
  },

  "events.removeProject"(projectId) {
    this.unblock();

    check(projectId, String);
    Events.remove({ "properties.task.project._id": projectId });
  }
});
