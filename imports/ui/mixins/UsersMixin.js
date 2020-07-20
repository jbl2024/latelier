import { UserUtils } from "/imports/api/users/utils";

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

      const emailComponents = UserUtils.getEmail(user).split("@")[0].split(".");
      if (emailComponents.length <= 1) {
        return emailComponents[0][0];
      }
      return emailComponents[0][0] + emailComponents[1][0];
    },

    formatUser(user) {
      user = getUser(user);
      if (!user) return null;
      return UserUtils.getEmail(user);
    },
    isOnlineClasses(isOnline) {
      return isOnline ? "blue" : "grey lighten-1";
    },
    isOnline(user) {
      user = getUser(user);
      return this.isOnlineClasses(user && user.statusConnection === "online");
    },
    getEmailForUser(user) {
      user = getUser(user);
      return UserUtils.getEmail(user);
    },
    getAvatarForUser(user) {
      user = getUser(user);
      if (!user || !user.profile) return null;
      return user.profile.avatar;
    },
    getUserProfileName(user) {
      if (user?.profile?.lastName) {
        return `${user?.profile?.firstName} ${user?.profile?.lastName}`;
      }
      return UserUtils.getEmail(user);
    }
  }
};
