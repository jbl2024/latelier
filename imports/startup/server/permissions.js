import { Accounts } from "meteor/accounts-base";
import { Permissions } from "/imports/api/permissions/permissions";
import { UserUtils } from "/imports/api/users/utils";

function initializeRoles() {
  const { roles } = Meteor.settings;
  const admin = roles.admin || [];
  admin.forEach(async (email) => {
    const user = Accounts.findUserByEmail(email);
    if (user) {
      if (!await Permissions.isAdmin(user._id)) {
        /* eslint no-console: off */
        console.info(`Adding ${UserUtils.getEmail(user)} to admin role`);
        await Roles.addUsersToRolesAsync(user._id, "admin", Roles.GLOBAL_GROUP);
      }
    } else {
      console.warn(`user with email ${email} not found`);
    }
  });
}

if (Meteor.settings.roles) {
  initializeRoles();
}
