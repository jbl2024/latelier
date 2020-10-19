import { Meteor } from "meteor/meteor";
import { Meetings } from "/imports/api/meetings/meetings";
import { check } from "meteor/check";
import { checkCanReadMeeting } from "/imports/api/permissions/permissions";

Meteor.publish("meeting", function coeditions(meetingId) {
  check(meetingId, String);
  checkCanReadMeeting(meetingId);
  return Meetings.find({ _id: meetingId });
});
