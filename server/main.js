import { Meteor } from 'meteor/meteor';
import '../imports/startup/server/fixtures.js';
import '../imports/startup/server/userPresence.js';
import '../imports/api/projects/projects.js';
import '../imports/api/projects/server/publications.js';
import '../imports/api/users/server/publications.js';

import '../imports/api/projectGroups/projectGroups.js';
import '../imports/api/projectGroups/server/publications.js';

Meteor.startup(() => {
  // code to run on server at startup
});
