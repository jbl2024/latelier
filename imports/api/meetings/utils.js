export default {
  getAttendeeName(attendee) {
    return `${attendee?.firstName} ${attendee?.lastName}`;
  },
  createUserAttendee(user) {
    return {
      userId: user._id,
      present: false,
      avatar: user?.profile?.avatar,
      firstName: user?.profile?.firstName ? user.profile.firstName : "",
      lastName: user?.profile?.lastName ? user.profile.lastName : "",
      email: user?.emails && user.emails[0] && user.emails[0].address ? user.emails[0].address : null
    };
  },
  createNewAttendee(name) {
    const splittedName = name.split(" ");
    return {
      userId: null,
      present: false,
      firstName: splittedName[0] ? splittedName[0] : "",
      lastName: splittedName[1] ? splittedName[1] : "",
      email: null
    };
  },
  formatUsersAsAttendees(users) {
    return users.map((user) => this.createUserAttendee(user));
  },
  createAttendeeLetters(attendee) {
    hasFirstName = attendee?.firstName != null && attendee?.firstName != "";
    hasLastName = attendee?.lastName != null && attendee?.lastName != "";
    return `${hasFirstName ? attendee.firstName[0] : ""}
    ${hasFirstName && hasLastName && attendee.lastName[0] ? attendee.lastName[0] : ""}`;
  }
};
