Meteor.startup(function() {
  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl(`reset-password/${token}`);
  };
});

if (Meteor.settings && Meteor.settings.email) {
  Accounts.emailTemplates.from = Meteor.settings.email.from;
} else {
  Accounts.emailTemplates.from = "noreply@localhost";
}
Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "Activate your account now!";
  },
  text(user, url) {
    return `Bienvenue sur l'atelier. Confirmer votre inscription en cliquant sur le lien suivant : ${url}`;
  },

  html(user, url) {
    const email = new MJML(Assets.absoluteFilePath("mjml/verifyEmail.mjml"));
    email.helpers({
      url
    });
    return email.compile();
  }
};
