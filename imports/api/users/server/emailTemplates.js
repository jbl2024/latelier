Accounts.emailTemplates.verifyEmail = {
  subject() {
     return "Activate your account now!";
  },
  text(user, url) {
     return `Bienvenue sur l'atelier. Confirmer votre inscription en cliquant sur le lien suivant : ${url}`;
  },

  html(user, url) {
    var email = new MJML(Npm.require('path').resolve('.').split('.meteor')[0]+ './server/mjml/verifyEmail.mjml');
    email.helpers({
      url: url,
    });
    return email.compile();
  }
};