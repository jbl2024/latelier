import { Meteor } from 'meteor/meteor';
import '../imports/startup/server/fixtures.js';
import '../imports/startup/server/userPresence.js';
import '../imports/api/projects/projects.js';
import '../imports/api/projects/server/publications.js';
import '../imports/api/users/server/publications.js';

Meteor.startup(() => {
  // code to run on server at startup
});
