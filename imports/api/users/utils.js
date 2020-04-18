export const UserUtils = {
  getEmail(user) {
    if (user.emails && user.emails.length > 0) {
      return user.emails[0].address;
    }
    if (user.profile && user.profile.email) {
      return user.profile.email;
    }
    return null;
  }
};
