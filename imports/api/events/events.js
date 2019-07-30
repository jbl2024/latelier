import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

export const Events = new Mongo.Collection("events");

if (Meteor.isServer) {
  import { callbacks as mailsCB} from "./server/mails";
  import { callbacks as remindersCB } from "./server/reminders";
  const callbacks = [mailsCB, remindersCB];

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

      callbacks.map(cb => {
        if (cb[event.type]) {
          cb[event.type](event);
        }
      });
    },

    "events.removeProject"(projectId) {
      this.unblock();

      check(projectId, String);
      Events.remove({"properties.task.project._id": projectId});
    }
  });
}