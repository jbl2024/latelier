import { Meteor } from "meteor/meteor";
import moment from "moment";
import i18n from "/imports/i18n/";

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
      email: Array.isArray(user?.emails)
      && user.emails[0]
      && user.emails[0].address ? user.emails[0].address : null
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
  createNewMeeting() {
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
  fetchMeetings: (params) => new Promise((resolve, reject) => {
    if (!params || !params.projectId) reject(new Error("Invalid project"));
    Meteor.call(
      "meetings.findMeetings",
      params,
      (error, datas) => {
        resolve(datas);
        if (error) {
          reject(error);
        }
      }
    );
  }),
  fetchMeeting: (params) => new Promise((resolve, reject) => {
    if (!params || !params.meetingId) reject(new Error("Invalid meeting"));
    Meteor.call(
      "meetings.get",
      params,
      (error, meeting) => {
        resolve(meeting);
        if (error) {
          reject(error);
        }
      }
    );
  }),
  fetchMeetingTypes: () => new Promise((resolve, reject) => {
    Meteor.call(
      "meetings.getTypes",
      null,
      (error, types) => {
        resolve(types);
        if (error) {
          reject(error);
        }
      }
    );
  })
};
