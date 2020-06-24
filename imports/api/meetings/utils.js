import moment from "moment";
import i18n from "/imports/i18n/";
import { UserUtils } from "../users/utils";

export default {
  getAttendeeName(attendee) {
    if (!attendee) {
      return "";
    }
    if (attendee.firstName && attendee.lastName) {
      return `${attendee.firstName} ${attendee.lastName}`;
    }
    if (attendee.lastName) {
      return attendee.lastName;
    }
    return attendee.email;
  },
  createUserAttendee(user) {
    return {
      attendeeId: Random.id(),
      userId: user._id,
      present: false,
      role: "attendee",
      avatar: user?.profile?.avatar,
      firstName: user?.profile?.firstName ? user.profile.firstName : "",
      lastName: user?.profile?.lastName ? user.profile.lastName : "",
      email: UserUtils.getEmail(user)
    };
  },
  createNewAttendee(name) {
    const splittedName = name.split(/\s+/);
    let firstName;
    let lastName;
    if (splittedName.length === 1) {
      firstName = "";
      /* eslint prefer-destructuring: off */
      lastName = splittedName[0];
    } else {
      firstName = splittedName.slice(0, -1).join(" ");
      lastName = splittedName.pop();
    }

    return {
      attendeeId: Random.id(),
      userId: null,
      present: false,
      role: "attendee",
      firstName,
      lastName,
      email: null
    };
  },
  sanitizeAttendee(attendee) {
    const sanitizedAttendee = { ...attendee };
    delete sanitizedAttendee.avatar;
    return sanitizedAttendee;
  },
  formatUsersAsAttendees(users) {
    return users.map((user) => this.createUserAttendee(user));
  },
  createAttendeeLetters(attendee) {
    hasFirstName = Boolean(attendee?.firstName);
    hasLastName = Boolean(attendee?.lastName);
    return `${hasFirstName ? attendee.firstName[0] : ""}
    ${hasFirstName && hasLastName && attendee.lastName[0] ? attendee.lastName[0] : ""}`;
  },
  formatMeetingsAsEvents: (meetings) => {
    const dateFormat = "YYYY-MM-DD HH:mm";
    return meetings.filter((meeting) => meeting.startDate && meeting.endDate).map((meeting) => ({
      id: meeting._id,
      name: meeting.name,
      description: meeting.description,
      location: meeting.location,
      type: meeting.type ? meeting.type : null,
      start: moment(meeting.startDate).format(dateFormat),
      end: moment(meeting.endDate).format(dateFormat),
      color: meeting.color
    }));
  },
  makeNewMeeting() {
    const startDate = moment();
    const endDate = startDate.clone().add(1, "hours");
    return {
      name: i18n.t("meetings.meeting"),
      description: "",
      agenda: "",
      type: "",
      color: "#363636",
      location: "",
      attendees: [],
      documents: [],
      startDate: startDate.format("YYYY-MM-DD HH:00"),
      endDate: endDate.format("YYYY-MM-DD HH:00")
    };
  },
  makeNewMeetingAction() {
    return {
      actionId: Random.id(),
      type: "action",
      description: "",
      dueDate: null,
      assignedTo: null
    };
  }
};
