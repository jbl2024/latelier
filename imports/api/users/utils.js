const UserUtils = {
  getEmail(user) {
    if (!user) {
      return null;
    }
    if (user.emails && user.emails.length > 0) {
      return user.emails[0].address;
    }
    if (user.profile && user.profile.email) {
      return user.profile.email;
    }
    return null;
  },
  hasAvatar(user) {
    return user?.profile?.avatar;
  },
  getUserProfileName(user) {
    if (user?.profile?.lastName) {
      return `${user?.profile?.firstName} ${user?.profile?.lastName}`;
    }
    return this.getEmail(user);
  }
};

if (Meteor.isServer) {
  // in future, we could reduce duplication by using this method
  UserUtils.loadUser = (aUserId, users = {}, fields = null) => {
    if (!aUserId) return {};
    const aUser = users[aUserId];
    if (aUser) {
      return aUser;
    }
    users[aUserId] = Meteor.users.findOne(
      { _id: aUserId },
      {
        fields: fields || {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1,
          roles: 1
        }
      }
    );
    return users[aUserId];
  };
}

export { UserUtils };
