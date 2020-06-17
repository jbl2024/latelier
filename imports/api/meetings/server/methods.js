import { Meteor } from "meteor/meteor";
import { MeetingState, MeetingTypes, Meetings } from "/imports/api/meetings/meetings";
// We use project rights for meeting rights
import {
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject,
  checkCanReadMeeting,
  checkCanWriteMeeting
} from "/imports/api/permissions/permissions";

import { AttendeeSchema } from "/imports/api/meetings/schema";

Meetings.methods.create = new ValidatedMethod({
  name: "meetings.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    state: { type: String, optional: true },
    description: { type: String, optional: true },
    agenda: { type: String, optional: true },
    color: { type: String, optional: true },
    location: { type: String, optional: true },
    type: { type: String, optional: true },
    startDate: { type: String },
    endDate: { type: String },
    attendees: {
      type: Array,
      optional: true
    },
    "attendees.$": {
      type: new SimpleSchema(AttendeeSchema)
    }
  }).validator(),
  run({
    projectId,
    name,
    state,
    description,
    agenda,
    color,
    location,
    type,
    startDate,
    endDate,
    attendees
  }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);
    const now = new Date();
    const author = Meteor.userId();
    state = state || MeetingState.PENDING;
    const meetingId = Meetings.insert({
      projectId,
      name,
      state,
      description,
      agenda,
      color,
      location,
      type,
      startDate,
      endDate,
      attendees,
      createdAt: now,
      createdBy: author,
      updatedAt: now,
      updatedBy: author
    });
    return meetingId;
  }
});

Meetings.methods.update = new ValidatedMethod({
  name: "meetings.update",
  validate: new SimpleSchema({
    id: { type: String },
    name: { type: String },
    state: { type: String, optional: true },
    description: { type: String, optional: true },
    agenda: { type: String, optional: true },
    color: { type: String, optional: true },
    location: { type: String, optional: true },
    type: { type: String, optional: true },
    startDate: { type: String },
    endDate: { type: String }
  }).validator(),
  run({ id, name, state, description, agenda, color, location, type, startDate, endDate }) {
    checkLoggedIn();

    state = state || MeetingState.PENDING;

    const meeting = Meetings.findOne({ _id: id });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteMeeting(meeting._id);

    const meetingId = Meetings.update(
      {
        _id: id
      },
      {
        $set: {
          name,
          state,
          description,
          agenda,
          color,
          location,
          type,
          startDate,
          endDate,
          updatedAt: new Date(),
          updateddBy: Meteor.userId()
        }
      }
    );

    return meetingId;
  }
});

Meetings.methods.updateAgenda = new ValidatedMethod({
  name: "meetings.updateAgenda",
  validate: new SimpleSchema({
    meetingId: { type: String },
    agenda: { type: String, optional: true }
  }).validator(),
  run({ meetingId, agenda }) {
    checkCanWriteMeeting(meetingId);

    const meeting = Meetings.findOne({ _id: meetingId });
    if (meeting.agenda === agenda) {
      return;
    }

    Meetings.update(
      {
        _id: meetingId
      },
      {
        $set: {
          agenda,
          updatedAt: new Date(),
          updateddBy: Meteor.userId()
        }
      }
    );
  }
});

Meetings.methods.updateReport = new ValidatedMethod({
  name: "meetings.updateReport",
  validate: new SimpleSchema({
    meetingId: { type: String },
    report: { type: String, optional: true }
  }).validator(),
  run({ meetingId, report }) {
    checkCanWriteMeeting(meetingId);

    const meeting = Meetings.findOne({ _id: meetingId });
    if (meeting.report === report) {
      return;
    }

    Meetings.update(
      {
        _id: meetingId
      },
      {
        $set: {
          report,
          updatedAt: new Date(),
          updateddBy: Meteor.userId()
        }
      }
    );
  }
});

Meetings.methods.remove = new ValidatedMethod({
  name: "meetings.remove",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkLoggedIn();
    Meetings.update(
      { _id: meetingId },
      {
        $set: {
          deleted: true,
          deletedBy: Meteor.userId(),
          deletedAt: new Date()
        }
      }
    );
  }
});


Meetings.methods.findMeetings = new ValidatedMethod({
  name: "meetings.findMeetings",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number },
    perPage: { type: Number, optional: true }
  }).validator(),
  run({ projectId, page, perPage }) {
    checkLoggedIn();
    checkCanReadProject(projectId);
    let skip = 0;
    if (perPage) {
      if (page) {
        skip = (page - 1) * perPage;
      }

      if (!skip) {
        skip = 0;
      }
    }
    const query = {
      projectId,
      deleted: { $ne: true }
    };

    const count = Meetings.find(query).count();
    const data = Meetings.find(query, {
      skip,
      limit: perPage,
      sort: {
        date: -1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Meetings.methods.get = new ValidatedMethod({
  name: "meetings.get",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkLoggedIn();
    const meeting = Meetings.findOne({ _id: meetingId });
    if (meeting) {
      checkCanReadMeeting(meeting._id);
    } else {
      throw new Meteor.Error("not-found");
    }
    return meeting;
  }
});

Meetings.methods.getTypes = new ValidatedMethod({
  name: "meetings.getTypes",
  validate: null,
  run() {
    return MeetingTypes;
  }
});
