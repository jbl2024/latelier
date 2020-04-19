import { Meteor } from "meteor/meteor";

Meteor.startup(function () {
  let oauth2 = {};
  if (Meteor.settings && Meteor.settings.auth) {
    oauth2 = Meteor.settings.auth.oauth2;
  }
  if (!oauth2.enabled) {
    return;
  }

  ServiceConfiguration.configurations.upsert(
    { service: "oidc" },
    {
      $set: {
        loginStyle: "redirect",
        clientId: oauth2.clientId,
        secret: oauth2.secret,
        serverUrl: oauth2.serverUrl,
        authorizationEndpoint: oauth2.authEndpoint,
        tokenEndpoint: oauth2.tokenEndpoint,
        userinfoEndpoint: oauth2.userinfoEndpoint,
        idTokenWhitelistFields: oauth2.idTokenWhitelistFields
      }
    }
  );
});
