
import MeetingUtils from "/imports/api/meetings/utils";

export default {
  methods: {
    isExternalAttendee(attendee) {
      return attendee.userId == null;
    },
    sanitizeAttendee(attendee) {
      return MeetingUtils.sanitizeAttendee(attendee);
    },
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
    },
    createAttendeeLetters(attendee) {
      return MeetingUtils.createAttendeeLetters(attendee);
    },
    addNewAttendee(name) {
      const attendee = MeetingUtils.createNewAttendee(name);
      this.createdAttendees.push(attendee);
      this.attendees.push(attendee);
    }
  }
};
