import { Meteor } from "meteor/meteor";
import { Email as MeteorEmail } from "meteor/email";

export const Email = {
  send({ to, subject, text, html }) {
    const prefix = Meteor.settings.email.prefix || "";
    const from = Meteor.settings.email.from || "noreply@localhost";

    MeteorEmail.send({
      from: from,
      to: to,
      subject: `${prefix}${subject}`,
      text,
      html
    });
  }
};
