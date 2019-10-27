const getUser = function(user) {
  if (!user) return null;
  if (typeof user === "string" || user instanceof String) {
    user = Meteor.users.findOne(
      { _id: user },
      {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1
        }
      }
    );
  }
  return user;
};

export default {
  methods: {
    formatUserLetters(user) {
      user = getUser(user);
      if (!user) return null;

      const emailComponents = user.emails[0].address.split("@")[0].split(".");
      if (emailComponents.length <= 1) {
        return emailComponents[0][0];
      }
      return emailComponents[0][0] + emailComponents[1][0];
    },

    formatUser(user) {
      user = getUser(user);
      if (!user) return null;
      return user.emails[0].address;
    },

    isOnline(user) {
      user = getUser(user);
      if (user && user.statusConnection === "online") {
        return "blue";
      }
      return "grey lighten-1";
    },

    getEmailForUser(user) {
      user = getUser(user);
      if (!user) return null;
      if (user.emails && user.emails.length > 0) {
        return user.emails[0].address;
      }
      return null;
    },

    getAvatarForUser(user) {
      user = getUser(user);
      if (!user || !user.profile) return null;
      return user.profile.avatar;
    }
  }
};
