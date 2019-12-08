import { Jobs } from "meteor/msavin:sjobs";
import { Email } from "meteor/email";
import { Projects } from "/imports/api/projects/projects";
import { Digests } from "/imports/api/digests/digests";
import * as htmlToText from "html-to-text";

import moment from "moment";

/**
 * Build email data suitable for sendEmail
 *
 * @param {subject, text, template} options
 */
const buildEmailData = function(options) {
  return {
    subject(user, digests, date) {
      return `${options.subject}`;
    },
    html(user, digests, date) {
      const email = new MJML(
        Assets.absoluteFilePath(`mjml/${options.template}`)
      );
      email.helpers({
        user,
        digests,
        date,
        emailSettingsUrl: Meteor.absoluteUrl("/settings/mail")
      });
      return email.compile();
    }
  };
};

/**
 * Send email using data build with buildEmailData
 *
 * @param {*} user
 * @param {*} task
 * @param {*} emailData
 */
const sendEmail = function(user, digests, date, emailData) {
  const html = emailData.html(user, digests, date);
  const text = htmlToText.fromString(html, {
    tables: true
  });
  try {
    Email.send({
      from: Meteor.settings.email.from,
      to: user.emails[0].address,
      subject: emailData.subject(user, digests),
      text,
      html
    });
  } catch (error) {
    /* eslint no-console: off */
    console.error(error);
  }
};

const digestIsEmpty = function(digest) {
  if (!digest) return true;
  if (
    digest.completed.length === 0 
    && digest.created.length === 0
    && digest.updated.length === 0
    && digest.removed.length === 0
  ) {
    return true;
  }
  return false;
};

Jobs.register({
  sendDigest() {
    const instance = this;
    const when = moment()
      .startOf("day")
      .add(-1, "days")
      .toDate();

    // get projects involved in digest
    const projectIds = Digests.aggregate([
      {
        $match: {
          when: when
        }
      },
      { $group: { _id: "$projectId" } }
    ]).map((res) => res._id);

    // get only users involved in projects
    const users = Meteor.users.find({
      "profile.favoriteProjects": { $in: projectIds },
      "emailSettings.digest.favorites": true
    });

    users.forEach((user) => {
      if (!user.profile) return;
      const favorites = user.profile.favoriteProjects || [];

      const digests = [];
      favorites.forEach((projectId) => {
        const project = Projects.findOne({ _id: projectId, members: user._id });
        if (!project) return;
        const completed = Digests.find({
          projectId: project._id,
          type: "tasks.complete",
          when: when
        }).fetch();
        const created = Digests.find({
          projectId: project._id,
          type: "tasks.create",
          when: when
        }).fetch();
        const updated = Digests.find({
          projectId: project._id,
          type: { $in: ["tasks.update", "tasks.uncomplete"] },
          when: when
        }).fetch();
        const removed = Digests.find({
          projectId: project._id,
          type: { $in: ["tasks.remove", "tasks.deleteForever"] },
          when: when
        }).fetch();

        const digest = {
          project: project,
          completed: completed,
          created: created,
          updated: updated,
          removed: removed
        };
        if (digestIsEmpty(digest)) return;
        digests.push(digest);
      });

      if (digests.length === 0) return;

      const emailData = buildEmailData({
        template: "digest.mjml",
        subject: `Rapport du ${moment(when).format("DD/MM/YYYY")}`
      });
      sendEmail(user, digests, moment(when).format("DD/MM/YYYY"), emailData);
    });
    instance.replicate({
      date: moment()
        .add(1, "days")
        .startOf("day")
        .add(7, "hours")
        .toDate()
    });
    instance.success();
  }
});

const when = moment()
  .startOf("day")
  .add(7, "hours");

Meteor.startup(function() {
  Jobs.run("sendDigest", {
    date: when.toDate(),
    singular: true
  });
});
