import moment from "moment";

export default {
  formatMeetingsAsEvents(meetings) {
    const dateFormat = "YYYY-MM-DD HH:mm";
    return meetings.map((meeting) => {
      return {
        id: meeting._id,
        name: meeting.name,
        start: moment(meeting.schedule).format(dateFormat),
        end: moment(meeting.schedule).format(dateFormat),
        color: "blue"
      }
    });
  }
}