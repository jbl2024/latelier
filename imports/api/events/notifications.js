import { Email } from "meteor/email";
import get from "lodash/get";
import * as htmlToText from 'html-to-text';
/**
 * Return user ids involved in task as array
 * 
 * @param {*} task 
 */
const findUserIdsInvolvedInTask = function (task) {
  let userIds = [task.assignedTo, task.createdBy, task.updatedBy];
  task.notes.map(note => {
    userIds.push(note.createdBy);
    userIds.push(note.editedBy);
  });
  userIds = [...new Set(userIds)]; // remove duplicates
  return userIds;
}

/**
 * Build email data suitable for sendEmail
 * 
 * @param {subject, text, template} options 
 */
const buildEmailData = function (options) {
  return {
    subject(user, task) {
      return `[${task.project.name}] ${options.subject}`;
    },
    html(user, task) {
      var email = new MJML(
        Assets.absoluteFilePath(`mjml/${options.template}`)
      );
      email.helpers({
        user: user,
        task: task,
        emailSettingsUrl: Meteor.absoluteUrl('/settings/mail')
      });
      return email.compile();
    }  
  }
}

/**
 * Send email using data build with buildEmailData
 * 
 * @param {*} user 
 * @param {*} task 
 * @param {*} emailData 
 */
const sendEmail = function (user, task, emailData) {
  const html = emailData.html(user, task);
  const text = htmlToText.fromString(html, {
    tables: true
  });
  try {
    Email.send({
      from: Meteor.settings.email.from,
      to: user.emails[0].address,
      subject: emailData.subject(user, task),
      text: text,
      html: html
    });
  } catch(error) {
    console.error(error);      
  }
}

const getUser = function (userId, event, settings) {
  const user = Meteor.users.findOne({ _id: userId });
  if (!user) return;
  if (user._id === event.userId) return;
  
  const enabled = get(user, `emailSettings.${settings}`, false);
  if (!enabled) return false;
  
  return user;
}

export const callbacks = {
  "tasks.assignTo"(event) {
    const task = event.properties.task;
    const user = getUser(task.assignedTo, event, "tasks.assignTo");
    if (!user) return;

    const emailData = buildEmailData({
      template: "tasks.assignTo.mjml",
      subject: "Une tâche vous a été assignée",
    });
    sendEmail(user, task, emailData)
  },

  "tasks.addNote"(event) {
    const task = event.properties.task;
    const userIds = findUserIdsInvolvedInTask(task);

    userIds.map(userId => {
      const user = getUser(userId, event, "tasks.update");
      if (!user) return;

      const emailData = buildEmailData({
        template: "tasks.addNote.mjml",
        subject: `[${task.name}] Une note a été ajoutée`,
      });
      sendEmail(user, task, emailData);
    });
  },
  
  "tasks.removeNote"(event) {
    const task = event.properties.task;
    const userIds = findUserIdsInvolvedInTask(task);

    userIds.map(userId => {
      const user = getUser(userId, event, "tasks.update");
      if (!user) return;

      const emailData = buildEmailData({
        template: "tasks.removeNote.mjml",
        subject: `[${task.name}] Une note a été supprimée`,
      });
      sendEmail(user, task, emailData);
    });
  },
  
  "tasks.updateNote"(event) {
    const task = event.properties.task;
    const userIds = findUserIdsInvolvedInTask(task);

    userIds.map(userId => {
      const user = getUser(userId, event, "tasks.update");
      if (!user) return;

      const emailData = buildEmailData({
        template: "tasks.updateNote.mjml",
        subject: `[${task.name}] Une note a été modifiée`,
      });
      sendEmail(user, task, emailData);
    });
  }    
};