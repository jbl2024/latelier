import { Meteor } from 'meteor/meteor';
import '../imports/startup/server/fixtures.js';
import '../imports/startup/server/fixEmptyAttributes.js';
import '../imports/startup/server/permissions.js';
import '../imports/startup/server/userPresence.js';
import '../imports/api/organizations/organizations.js';
import '../imports/api/organizations/server/publications.js';
import '../imports/api/resources/server/publications.js';
import '../imports/api/projects/projects.js';
import '../imports/api/projects/server/publications.js';
import '../imports/api/users/permissions.js';
import '../imports/api/users/users.js';
import '../imports/api/users/server/emailTemplates.js';
import '../imports/api/users/server/publications.js';
import '../imports/api/projectGroups/projectGroups.js';
import '../imports/api/projectGroups/server/publications.js';
import '../imports/api/labels/labels.js';
import '../imports/api/labels/server/publications.js';
import '../imports/api/events/events.js';
import '../imports/api/backgrounds/startup/server/fixtures.js';

if (Meteor.isServer) {
  Inject.rawBody("loader", Assets.getText('loader.html'));
}

if (Meteor.isDevelopment){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}


Accounts.config({
  forbidClientAccountCreation : false,
  sendVerificationEmail: true
});

Meteor.startup(() => {
  Meteor.call('organizations.fixOrphanProjects');
  Meteor.call('organizations.fixOrphanProjectGroups');
});
