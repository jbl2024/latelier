var getUser = function (user) {
  if (typeof user === 'string' || user instanceof String) {
    user = Meteor.users.findOne({_id: user}, { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 } });
  }
  return user;
}

export default {
  methods: {
    formatUserLetters (user) {
      if (!user) {
        return;
      }
      user = getUser(user);
      var emailComponents = user.emails[0].address.split('.');
      if (emailComponents.length <= 1) {
        return emailComponents[0][0];
      }
      return emailComponents[0][0] + emailComponents[1][0];
    },

    formatUser (user) {
      if (!user) {
        return;
      }
      user = getUser(user);
      return user.emails[0].address;
    },

    isOnline (user) {
      if (!user) {
        return;
      }
      user = getUser(user);
      if (user.statusConnection == 'online') {
        return 'md-primary';
      }
    },
  }
}