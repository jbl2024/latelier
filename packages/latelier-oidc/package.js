/* eslint-disable */
Package.describe({
  summary: "OpenID Connect (OIDC) flow for Meteor",
  version: "2.0.0",
  name: "latelier-oidc"
});

Package.onUse(function(api) {
  api.use('oauth2@1.3.0', ['client', 'server']);
  api.use('oauth@2.0.0', ['client', 'server']);
  api.use('http@1.1.0', ['server']);
  api.use('underscore@1.0.0', 'client');
  api.use('templating@1.1.0', 'client');
  api.use('random@1.0.0', 'client');
  api.use('service-configuration@1.0.0', ['client', 'server']);

  api.export('Oidc');

  api.addFiles(['oidc_configure.html', 'oidc_configure.js'], 'client');

  api.addFiles('oidc_server.js', 'server');
  api.addFiles('oidc_client.js', 'client');
});
