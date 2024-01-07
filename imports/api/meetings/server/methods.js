import { Meteor } from "meteor/meteor";
import { MeetingState, MeetingRoles, Meetings } from "/imports/api/meetings/meetings";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import { UserUtils } from "/imports/api/users/utils";

import moment from "moment";
import fs from "fs";
import {
  compileTemplate,
  convertHtml
} from "/imports/docConverter";
import i18n from "/imports/i18n/server/";

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

const loadUser = async (aUserId) => {
  if (!aUserId) return {};
  return Meteor.users.findOneAsync(
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

Meetings.methods.create = new ValidatedMethod({
  name: "meetings.create",
  validate: MeetingCreateSchema.validator(),
  async run({
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
    report,
    meetingUserId
  }) {
    await checkCanWriteProject(projectId);

    const now = new Date();

    let author = Meteor.userId();
    const canSelectUserId = meetingUserId && Meteor.isServer && Permissions.isAdmin(author);
    author = canSelectUserId ? meetingUserId : author;

    state = state || MeetingState.PENDING;

    attendees = Array.isArray(attendees) ? attendees : [];
    documents = Array.isArray(documents) ? documents : [];
    actions = Array.isArray(actions) ? actions : [];

    const meetingId = await Meetings.insertAsync({
      projectId,
      name,
      state,
      description,
      agenda,
      report,
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
  async run({
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
    await checkCanWriteMeeting(id);

    state = state || MeetingState.PENDING;
    const meetingId = await Meetings.updateAsync(
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
          updatedBy: Meteor.userId()
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
  async run({ meetingId, agenda }) {
    await checkCanWriteMeeting(meetingId);

    const meeting = await Meetings.findOneAsync({ _id: meetingId });
    if (meeting.agenda === agenda) {
      return;
    }

    await Meetings.updateAsync(
      {
        _id: meetingId
      },
      {
        $set: {
          agenda,
          updatedAt: new Date(),
          updatedBy: Meteor.userId()
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
  async run({ meetingId, report }) {
    await checkCanWriteMeeting(meetingId);

    const meeting = await Meetings.findOneAsync({ _id: meetingId });
    if (meeting.report === report) {
      return;
    }

    await Meetings.updateAsync(
      {
        _id: meetingId
      },
      {
        $set: {
          report,
          updatedAt: new Date(),
          updatedBy: Meteor.userId()
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
  async run({ meetingId }) {
    await checkCanDeleteMeeting(meetingId);
    // @todo check can write
    await Meetings.updateAsync(
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
  async run({ meetingId }) {
    await checkCanDeleteMeeting(meetingId);
    // @todo remove only if it has exclusively meetingId as meta ?
    // Attachments.remove({ "meta.projectId": projectId });
    await Meetings.removeAsync(meetingId);
  }
});

Meetings.methods.restore = new ValidatedMethod({
  name: "meetings.restore",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    await checkCanWriteMeeting(meetingId);
    await Meetings.updateAsync(
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
    },
    showArchivedProjects: {
      type: Boolean,
      optional: true
    },
    sortAsc: {
      type: Boolean,
      optional: true,
      defaultValue: true
    }
  }).validator(),
  async run({ projectId,
    organizationId,
    dates,
    page,
    perPage,
    documentsIds,
    withRelated,
    showArchivedProjects,
    sortAsc }) {
    if (projectId) {
      await checkCanReadProject(projectId);
    }
    if (organizationId) {
      await checkCanReadOrganization(organizationId);
    }

    const userId = Meteor.userId();
    const isRegularUser = !await Permissions.isAdmin(userId);

    let skip = 0;
    if (perPage) {
      if (page) {
        skip = (page - 1) * perPage;
      }

      if (!skip) {
        skip = 0;
      }
    }

    // get projects
    const projectQuery = {
      deleted: { $ne: true }
    };
    if (!showArchivedProjects && !projectId) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }
    if (isRegularUser) {
      projectQuery.members = userId;
    }

    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }

    if (projectId) {
      projectQuery._id = projectId;
    }

    const projectIds = Projects.find(projectQuery, {
      fields: {
        _id: 1
      }
    }).map((project) => project._id);

    const meetingQuery = {
      deleted: { $ne: true },
      projectId: { $in: projectIds }
    };

    if (Array.isArray(dates) && dates.length) {
      meetingQuery.$or = dates.map((d) => {
        const $and = [];
        if (d.start) {
          $and.push({ startDate: { $gte: moment(d.start).toDate() } });
        }
        if (d.end) {
          $and.push({ endDate: { $lte: moment(d.end).toDate() } });
        }
        return $and.length > 0 ? { $and } : null;
      });
    }

    if (Array.isArray(documentsIds) && documentsIds.length) {
      meetingQuery["documents.documentId"] = { $in: documentsIds };
    }
    const count = await Meetings.find(meetingQuery).countAsync();
    const data = await Meetings.find(meetingQuery, {
      skip,
      limit: perPage,
      sort: {
        startDate: sortAsc === true ? 1 : -1
      }
    });

    // load associated objects and assign them to meetings
    const projects = {};
    const organizations = {};
    let loadedData = [];
    if (withRelated === true) {
      data.forEachAsync(async (meeting) => {
        let project = projects[meeting.projectId];
        if (!project) {
          projects[meeting.projectId] = await Projects.findOneAsync({ _id: meeting.projectId });
          project = projects[meeting.projectId];
        }
        if (project) {
          meeting.project = project;
          let organization = organizations[project.organizationId];
          if (!organization) {
            organizations[project.organizationId] = await Organizations.findOneAsync({
              _id: project.organizationId
            });
            organization = organizations[project.organizationId];
          }
          if (organization) {
            meeting.organization = organization;
          }
          loadedData.push(meeting);
        }
      });
    } else {
      loadedData = await data.fetchAsync();
    }
    const totalPages = !perPage ? 0 : Math.ceil(count / perPage);
    return {
      rowsPerPage: perPage || 0,
      totalItems: count,
      totalPages,
      data: loadedData
    };
  }
});

Meetings.methods.get = new ValidatedMethod({
  name: "meetings.get",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    await checkCanReadMeeting(meetingId);
    const meeting = await Meetings.findOneAsync(
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
  async run() {
    return MeetingRoles;
  }
});

Meetings.methods.getActions = new ValidatedMethod({
  name: "meetings.getActions",
  validate: new SimpleSchema({
    meetingId: { type: String }
  }).validator(),
  async run({ meetingId }) {
    await checkCanReadMeeting(meetingId);
    const meeting = await Meetings.findOneAsync({ _id: meetingId });
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
  async run({
    meetingId,
    action
  }) {
    await checkCanWriteMeeting(meetingId);
    if (action.dueDate) {
      action.dueDate = moment(action.dueDate, "YYYY-MM-DD HH:mm").toDate();
    }
    const returnedId = await Meetings.updateAsync(
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
  async run({
    meetingId,
    action
  }) {
    await checkCanReadMeeting(meetingId);
    const returnedId = await Meetings.updateAsync(
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
  async run({ meetingId, actionsIds }) {
    await checkCanWriteMeeting(meetingId);
    if (!Array.isArray(actionsIds) || !actionsIds.length) return false;
    const ids = await Meetings.updateAsync(
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
  async run({ page, filter, isDeleted }) {
    if (!await Permissions.isAdmin(Meteor.userId())) {
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
    const count = await Meetings.find(query).countAsync();

    const data = Meetings
      .find(query, {
        skip,
        limit: perPage,
        sort: {
          name: 1
        }
      });

    const loadedData = [];
    data.forEachAsync(async (meeting) => {
      meeting.createdBy = await loadUser(meeting.createdBy);
      loadedData.push(meeting);
    });

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data: loadedData
    };
  }
});

Meetings.methods.export = new ValidatedMethod({
  name: "meetings.export",
  validate: new SimpleSchema({
    meetingId: { type: String },
    format: { type: String },
    locale: {
      type: String,
      defaultValue: "en"
    }
  }).validator(),
  async run({ meetingId, format, locale }) {
    await checkCanReadMeeting(meetingId);

    const meeting = await Meetings.findOneAsync({ _id: meetingId });
    if (!meeting) {
      throw new Meteor.Error("not-found");
    }

    meeting.createdBy = await loadUser(meeting.createdBy);
    // Gathering all meeting related users
    const attendeesIds = Array.isArray(meeting.attendees)
      ? meeting.attendees.map((a) => a.userId) : [];
    const assignedIds = Array.isArray(meeting.actions)
      ? meeting.actions.map((a) => a.assignedTo) : [];
    const users = attendeesIds.concat(assignedIds).reduce(async (aUsers, userId) => {
      if (!aUsers[userId]) {
        aUsers[userId] = await loadUser(userId);
      }
      return aUsers;
    }, {});

    const project = await Projects.findOneAsync({ _id: meeting.projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }

    const i18nHelper = i18n(locale.split("-")[0]);
    if (meeting.actions) {
      meeting.actions.forEach((action) => {
        action.typeString = i18nHelper.t("meetings.actions.types")[action.type];
      });
    }

    try {
      const templateFile = Assets.absoluteFilePath("exports/meetings/default.html");
      const datas = {
        meeting,
        project,
        users: await Promise.all(Object.values(users)),
        datesFormats: i18nHelper.t("dates.format")
      };
      const html = compileTemplate(fs.readFileSync(templateFile, "utf8"), datas, {
        i18n(str, aDatas = {}) {
          return (i18nHelper !== undefined ? i18nHelper.t(str, aDatas) : str);
        },
        date(dateStr, aFormat) {
          if (!aFormat) {
            aFormat = datas.datesFormats.prettyDate;
          }
          if (!dateStr) return "";
          const date = moment(dateStr);
          date.locale(locale);
          return date.format(aFormat);
        },
        async getUserProfileName(user) {
          if (!user) {
            return null;
          }
          if (!user._id) {
            user = await loadUser(user);
          }
          return UserUtils.getUserProfileName(user);
        }
      });

      // Assuming convertHtml is now an async function
      const result = await convertHtml(html, format);

      return {
        data: result
      };
    } catch (error) {
      throw new Meteor.Error("cannot-convert", error.message);
    }
  }
});
