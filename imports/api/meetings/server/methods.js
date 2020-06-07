import { Meteor } from "meteor/meteor";
import { MeetingState, Meetings } from "/imports/api/meetings/meetings";
import {
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

Meetings.methods.create = new ValidatedMethod({
  name: "meetings.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    state: { type: String, optional: true },
    description: { type: String, optional: true }
  }).validator(),
  run({ projectId, name, state, description }) {
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
    description: { type: String, optional: true }
  }).validator(),
  run({ id, name, state, description }) {
    checkLoggedIn();

    state = state || MeetingState.PENDING;

    const meeting = Meetings.findOne({ _id: id });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(meeting.projectId);

    const meetingId = Meetings.update(
      {
        _id: id
      },
      {
        $set: {
          name,
          state,
          description,
          updatedAt: new Date(),
          updateddBy: Meteor.userId()
        }
      }
    );

    return meetingId;
  }
});


Meetings.methods.remove = new ValidatedMethod({
  name: "meetings.remove",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),
  run({ id }) {
    checkLoggedIn();

    const meeting = Meetings.findOne({ _id: id });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(meeting.projectId);
    Meetings.remove(id);
  }
});


Meetings.methods.findMeetings = new ValidatedMethod({
  name: "meetings.findMeetings",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number }
  }).validator(),
  run({ projectId, page }) {
    checkLoggedIn();
    checkCanReadProject(projectId);

    const perPage = 25;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {
      projectId
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
      checkCanReadProject(meeting.projectId);
    } else {
      throw new Meteor.Error("not-found");
    }
    return meeting;
  }
});
