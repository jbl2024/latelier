import { Accounts } from 'meteor/accounts-base'
import { Permissions } from '/imports/api/users/permissions'

function initializeRoles() {
  const roles = Meteor.settings.roles;
  const admin = roles.admin || [];
  admin.map (email => {
    const user = Accounts.findUserByEmail(email);
    if (user) {
      if (!Permissions.isAdmin(user._id)) {
        console.info('Adding ' + user.emails[0].address + ' to admin role');
        Roles.addUsersToRoles(user._id, Roles.admin, Groups.GLOBAL);
      }
    } else {
      console.warn('user with email ' + email + ' not found')
    }
  });
}

if (Meteor.settings.roles) {
  initializeRoles();
}
