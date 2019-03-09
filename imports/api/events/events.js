import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Email } from "meteor/email";

export const Events = new Mongo.Collection("events");

const callbacks = {
  "tasks.assignTo"(event) {
    if (event.type === "tasks.assignTo") {
      const task = event.properties.task;
      const user = Meteor.users.findOne({ _id: task.assignedTo });
      if (!user) return;
      if (user.emailSettings && !user.emailSettings.tasks.assignTo) return;

      const email = {
        subject(user, task) {
          return `[${task.project.name}] Une tâche vous a été assignée`;
        },
        text(user, task) {
          return `Tache assignée`;
        },

        html(user, task) {
          var email = new MJML(
            Assets.absoluteFilePath("mjml/tasks.assignTo.mjml")
          );
          email.helpers({
            user: user,
            task: task,
            emailSettingsUrl: Meteor.absoluteUrl('/settings/mail')
          });
          return email.compile();
        }
      };
      Email.send({
        from: Meteor.settings.email.from,
        to: user.emails[0].address,
        subject: email.subject(user, task),
        text: email.text(user, task),
        html: email.html(user, task)
      });
    }
  }
};

Events.onTrack = function(name, callback) {
  if (!callbacks[name].isArray()) callbacks[name] = [];

  callbacks[name].push(callback);
};

if (Meteor.isServer) {
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

      if (callbacks[event.type] && Array.isArray(callbacks[event.type])) {
        callbacks[event.type].map(cb => {
          cb(event);
        });
      } else if (callbacks[event.type]) {
        callbacks[event.type](event);
      }
    }
  });
}