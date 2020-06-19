import { Meteor } from "meteor/meteor";
import { MeetingState, MeetingTypes, Meetings } from "/imports/api/meetings/meetings";
import moment from "moment";
// We use project rights for meeting rights
import {
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject,
  checkCanReadMeeting,
  checkCanWriteMeeting
} from "/imports/api/permissions/permissions";

import { MeetingCreateSchema, MeetingUpdateSchema } from "/imports/api/meetings/schema";

Meetings.methods.create = new ValidatedMethod({
  name: "meetings.create",
  validate: MeetingCreateSchema.validator(),
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
    attendees,
    documents
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
      documents,
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
  validate: MeetingUpdateSchema.validator(),
  run({
    id,
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
    documents
  }) {
    checkLoggedIn();

    state = state || MeetingState.PENDING;

    const meeting = Meetings.findOne({ _id: id });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteMeeting(meeting._id);
    console.log(JSON.stringify(documents, null, 2));
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
          attendees,
          documents,
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
    dates: {
      type: Array,
      optional: true
    },
    "dates.$": {
      type: Object
    },
    "dates.$.start": { type: String },
    "dates.$.end": { type: String },
    page: { type: Number },
    perPage: { type: Number, optional: true }
  }).validator(),
  run({ projectId, dates, page, perPage }) {
    page = page || 1;
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

    if (Array.isArray(dates) && dates.length) {
      query.$or = dates.map((d) => ({
        $and: [
          { startDate: { $gte: moment.utc(d.start).toDate() } },
          { endDate: { $lte: moment.utc(d.end).toDate() } }
        ]
      }));
    }
    const count = Meetings.find(query).count();
    const data = Meetings.find(query, {
      skip,
      limit: perPage,
      sort: {
        startDate: -1
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
