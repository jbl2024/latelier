import { Meteor } from "meteor/meteor";
import { MeetingState, MeetingRoles, Meetings } from "/imports/api/meetings/meetings";
import { Projects } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import moment from "moment";
// We use project rights for meeting rights
import {
  Permissions,
  checkCanReadProject,
  checkCanReadOrganization,
  checkCanWriteProject,
  checkCanDeleteMeeting,
  checkCanReadMeeting,
  checkCanWriteMeeting
} from "/imports/api/permissions/permissions";

import { MeetingCreateSchema, MeetingUpdateSchema, ActionCreateUpdateSchema } from "/imports/api/meetings/schema";
import SimpleSchema from "simpl-schema";

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
    documents,
    actions
  }) {
    checkCanWriteProject(projectId);

    const now = new Date();
    const author = Meteor.userId();
    state = state || MeetingState.PENDING;

    attendees = Array.isArray(attendees) ? attendees : [];
    documents = Array.isArray(documents) ? documents : [];
    actions = Array.isArray(actions) ? actions : [];

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
      actions,
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
    documents,
    actions
  }) {
    checkCanWriteMeeting(id);

    state = state || MeetingState.PENDING;
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
          actions,
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
    checkCanDeleteMeeting(meetingId);
    // @todo check can write
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

Meetings.methods.deleteForever = new ValidatedMethod({
  name: "meetings.deleteForever",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkCanDeleteMeeting(meetingId);
    // @todo remove only if it has exclusively meetingId as meta ?
    // Attachments.remove({ "meta.projectId": projectId });
    Meetings.remove(meetingId);
  }
});

Meetings.methods.restore = new ValidatedMethod({
  name: "meetings.restore",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkCanWriteMeeting(meetingId);
    Meetings.update(
      { _id: meetingId },
      {
        $set: {
          deleted: false
        }
      }
    );
  }
});


Meetings.methods.findMeetings = new ValidatedMethod({
  name: "meetings.findMeetings",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: true
    },
    organizationId: {
      type: String,
      optional: true
    },
    dates: {
      type: Array,
      optional: true
    },
    "dates.$": {
      type: Object
    },
    "dates.$.start": {
      type: String,
      optional: true
    },
    "dates.$.end": {
      type: String,
      optional: true
    },
    documentsIds: {
      type: Array,
      optional: true
    },
    "documentsIds.$": {
      type: String
    },
    page: {
      type: Number,
      optional: true,
      defaultValue: 1
    },
    perPage: {
      type: Number,
      optional: true,
      defaultValue: 0
    },
    withRelated: {
      type: Boolean,
      optional: true,
      defaultValue: false
    }
  }).validator(),
  run({ projectId, organizationId, dates, page, perPage, documentsIds, withRelated }) {
    if (projectId) {
      checkCanReadProject(projectId);
    }
    if (organizationId) {
      checkCanReadOrganization(organizationId);
    }

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
      deleted: { $ne: true }
    };
    if (projectId) {
      query.projectId = projectId;
    }

    if (organizationId) {
      const projects = Projects.find({ organizationId }).fetch();
      if (projects && Array.isArray(projects)) {
        query.projectId = { $in: projects.map((p) => p._id) };
      }
    }

    const dateFormat = "YYYY-MM-DD HH:mm:ss";

    if (Array.isArray(dates) && dates.length) {
      query.$or = dates.map((d) => {
        const $and = [];
        if (d.start) {
          $and.push({ startDate: { $gte: moment(d.start, dateFormat).toDate() } });
        }
        if (d.end) {
          $and.push({ endDate: { $lte: moment(d.end, dateFormat).toDate() } });
        }
        return $and.length > 0 ? { $and } : null;
      });
    }

    if (Array.isArray(documentsIds) && documentsIds.length) {
      query["documents.documentId"] = { $in: documentsIds };
    }
    const count = Meetings.find(query).count();
    let data = Meetings.find(query, {
      skip,
      limit: perPage,
      sort: {
        startDate: 1
      }
    }).fetch();

    if (!projectId) {
      data = data.filter((meeting) => {
        try {
          checkCanReadProject(meeting.projectId);
          return true;
        } catch (error) {
          return false;
        }
      });
    }

    // load associated objects and assign them to meetings
    const projects = {};
    const organizations = {};
    if (withRelated === true) {
      data.forEach((meeting) => {
        let project = projects[meeting.projectId];
        if (!project) {
          projects[meeting.projectId] = Projects.findOne({ _id: meeting.projectId });
          project = projects[meeting.projectId];
        }
        if (project) {
          meeting.project = project;
          let organization = organizations[project.organizationId];
          if (!organization) {
            organizations[project.organizationId] = Organizations.findOne({
              _id: project.organizationId
            });
            organization = organizations[project.organizationId];
          }
          if (organization) {
            meeting.organization = organization;
          }
        }
      });
    }
    const totalPages = !perPage ? 0 : Math.ceil(count / perPage);
    return {
      rowsPerPage: perPage || 0,
      totalItems: count,
      totalPages,
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
    checkCanReadMeeting(meetingId);
    const meeting = Meetings.findOne(
      {
        _id: meetingId,
        deleted: { $ne: true }
      }
    );
    return meeting;
  }
});

Meetings.methods.getRoles = new ValidatedMethod({
  name: "meetings.getRoles",
  validate: null,
  run() {
    return MeetingRoles;
  }
});

Meetings.methods.getActions = new ValidatedMethod({
  name: "meetings.getActions",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  run({ meetingId }) {
    checkCanReadMeeting(meetingId);
    const meeting = Meetings.findOne({ _id: meetingId });
    return meeting.actions && Array.isArray(meeting.actions) ? meeting.actions : [];
  }
});

Meetings.methods.createAction = new ValidatedMethod({
  name: "meetings.createAction",
  validate: new SimpleSchema({
    meetingId: { type: String },
    action: {
      type: new SimpleSchema(ActionCreateUpdateSchema)
    }
  }).validator(),
  run({
    meetingId,
    action
  }) {
    checkCanWriteMeeting(meetingId);
    if (action.dueDate) {
      action.dueDate = moment(action.dueDate, "YYYY-MM-DD HH:mm").toDate();
    }
    const returnedId = Meetings.update(
      { _id: meetingId },
      {
        $push: { actions: action }
      }
    );
    if (!returnedId) {
      throw new Meteor.Error("not-found");
    }
  }
});

Meetings.methods.updateAction = new ValidatedMethod({
  name: "meetings.updateAction",
  validate: new SimpleSchema({
    meetingId: { type: String },
    action: {
      type: new SimpleSchema(ActionCreateUpdateSchema)
    }
  }).validator(),
  run({
    meetingId,
    action
  }) {
    checkCanReadMeeting(meetingId);
    if (action.dueDate) {
      action.dueDate = moment(action.dueDate, "YYYY-MM-DD HH:mm").toDate();
    }
    const returnedId = Meetings.update(
      {
        _id: meetingId,
        "actions.actionId": action.actionId
      },
      { $set: { "actions.$": action } }
    );
    if (!returnedId) {
      throw new Meteor.Error("not-found");
    }
    return returnedId;
  }
});

Meetings.methods.deleteActions = new ValidatedMethod({
  name: "meetings.deleteActions",
  validate: new SimpleSchema({
    meetingId: {
      type: String
    },
    actionsIds: {
      type: Array,
      min: 1
    },
    "actionsIds.$": {
      type: String
    }
  }).validator(),
  run({ meetingId, actionsIds }) {
    checkCanWriteMeeting(meetingId);
    if (!Array.isArray(actionsIds) || !actionsIds.length) return false;
    const ids = Meetings.update(
      { _id: meetingId },
      {
        $pull: {
          actions: {
            actionId: { $in: actionsIds }
          }
        }
      }
    );
    return ids;
  }
});

Meetings.methods.adminFind = new ValidatedMethod({
  name: "admin.findMeetings",
  validate: new SimpleSchema({
    page: { type: Number },
    filter: { type: String, optional: true },
    isDeleted: { type: Boolean, optional: true }
  }).validator(),
  run({ page, filter, isDeleted }) {
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {};
    if (filter && filter.length > 0) {
      query.name = {
        $regex: `.*${filter}.*`,
        $options: "i"
      };
    }
    if (isDeleted) {
      query.deleted = true;
    }
    const count = Meetings.find(query).count();

    const data = Meetings
      .find(query, {
        skip,
        limit: perPage,
        sort: {
          name: 1
        }
      })
      .fetch();

    const loadUser = (aUserId) => {
      if (!aUserId) return {};
      return Meteor.users.findOne(
        { _id: aUserId },
        {
          fields: {
            profile: 1,
            status: 1,
            statusDefault: 1,
            statusConnection: 1,
            emails: 1,
            roles: 1
          }
        }
      );
    };

    data.forEach((meeting) => {
      meeting.createdBy = loadUser(meeting.createdBy);
    });

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});
