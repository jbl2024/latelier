import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Email } from "meteor/email";

export const Events = new Mongo.Collection("events");

const callbacks = {
  "tasks.assignTo"(event) {
    if (event.type !== "tasks.assignTo") {
      return;
    }
    const task = event.properties.task;
    const user = Meteor.users.findOne({ _id: task.assignedTo });
    if (!user) return;
    if (user.emailSettings && !user.emailSettings.tasks.assignTo) return;
    if (user._id === event.userId) return;

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
    try {
      Email.send({
        from: Meteor.settings.email.from,
        to: user.emails[0].address,
        subject: email.subject(user, task),
        text: email.text(user, task),
        html: email.html(user, task)
      });
    } catch(error) {
      console.error(error);      
    }
  },

  "tasks.addNote"(event) {
    if (event.type !== "tasks.addNote") {
      return;
    }
    const task = event.properties.task;
    let userIds = [task.assignedTo, task.createdBy, task.updatedBy];
    task.notes.map(note => {
      console.log(note)
      userIds.push(note.createdBy);
      userIds.push(note.editedBy);
    });
    userIds = [...new Set(userIds)]; // remove duplicates
    userIds.map(userId => {
      const user = Meteor.users.findOne({ _id: userId });
      if (!user) return;
      if (user.emailSettings && !user.emailSettings.tasks.addNote) return;
      if (user._id === event.userId) return;

      const email = {
        subject(user, task) {
          return `[${task.project.name}] Une note a été ajoutée`;
        },
        text(user, task) {
          return `Note ajoutée`;
        },

        html(user, task) {
          var email = new MJML(
            Assets.absoluteFilePath("mjml/tasks.addNote.mjml")
          );
          email.helpers({
            user: user,
            task: task,
            emailSettingsUrl: Meteor.absoluteUrl('/settings/mail')
          });
          return email.compile();
        }
      };
      try {
        Email.send({
          from: Meteor.settings.email.from,
          to: user.emails[0].address,
          subject: email.subject(user, task),
          text: email.text(user, task),
          html: email.html(user, task)
        });
      } catch(error) {
        console.error(error);      
      }
    });
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