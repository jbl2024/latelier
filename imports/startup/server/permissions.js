import { Accounts } from 'meteor/accounts-base'

function initializeRoles() {
  const roles = Meteor.settings.roles;
  const admin = roles.admin || [];
  admin.map (email => {
    const user = Accounts.findUserByEmail(email);
    if (user) {
      console.log (user)
      if (!Roles.userIsInRole(user._id, 'admin', Roles.GLOBAL_GROUP)) {
        console.info('Adding ' + user.emails[0].address + ' to admin role');
        Roles.addUsersToRoles(user._id, 'admin', Roles.GLOBAL_GROUP);
      }
    } else {
      console.warn('user with email ' + email + ' not found')
    }
  });
}

if (Meteor.settings.roles) {
  initializeRoles();
}
