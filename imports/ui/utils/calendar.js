import moment from "moment";

export default {
  formatMeetingsAsEvents(meetings) {
    const dateFormat = "YYYY-MM-DD HH:mm";
    return meetings.filter((meeting) => {
      return meeting.startDate && meeting.endDate;
    }).map((meeting) => {
      return {
        id: meeting._id,
        name: meeting.name,
        start: moment(meeting.startDate).format(dateFormat),
        end: moment(meeting.endDate).format(dateFormat),
        color: meeting.color
      }
    });
  }
}