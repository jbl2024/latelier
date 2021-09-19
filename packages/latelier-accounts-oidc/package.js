/* eslint-disable */
Package.describe({
  summary: "OpenID Connect (OIDC) for Meteor accounts",
  version: "2.0.0",
  name: "latelier-accounts-oidc"
});

Package.onUse(function(api) {
  api.use('accounts-base@2.0.1', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth@1.3.0', ['client', 'server']);
  api.use('latelier-oidc@2.0.0', ['client', 'server']);

  api.addFiles('oidc_login_button.css', 'client');

  api.addFiles('oidc.js');
});
