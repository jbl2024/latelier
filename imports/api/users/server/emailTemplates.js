Meteor.startup(function() {
  Accounts.urls.resetPassword = function(token) {
     return Meteor.absoluteUrl('reset-password/' + token);
   };
 });
 
 
Accounts.emailTemplates.from  = Meteor.settings.email.from;
Accounts.emailTemplates.verifyEmail = {
  subject() {
     return "Activate your account now!";
  },
  text(user, url) {
     return `Bienvenue sur l'atelier. Confirmer votre inscription en cliquant sur le lien suivant : ${url}`;
  },

  html(user, url) {
    var email = new MJML(Assets.absoluteFilePath('mjml/verifyEmail.mjml'));
    email.helpers({
      url: url,
    });
    return email.compile();
  }
};

