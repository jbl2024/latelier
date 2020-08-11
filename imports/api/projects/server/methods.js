import SimpleSchema from "simpl-schema";
import { Projects } from "../projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { Canvas } from "/imports/api/canvas/canvas";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Meetings } from "/imports/api/meetings/meetings";

import { findProjectMembersIds } from "/imports/api/projects/server/common";

import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

Projects.methods.load = new ValidatedMethod({
  name: "projects.load",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    organizationId: { type: String, optional: true },
    page: { type: Number }
  }).validator(),
  run({ name, organizationId, page }) {
    checkLoggedIn();

    const userId = Meteor.userId();
    const query = { deleted: { $ne: true } };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = Projects.find(query).count();
    const data = Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Projects.methods.info = new ValidatedMethod({
  name: "projects.info",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkCanReadProject(projectId);
    const project = Projects.findOne({ _id: projectId });
    const taskCount = Tasks.find({
      projectId: projectId,
      deleted: { $ne: true }
    }).count();

    const completedTaskCount = Tasks.find({
      projectId: projectId,
      completed: true,
      deleted: { $ne: true }
    }).count();

    const userCount = (project.members || []).length;
    const diagramCount = ProcessDiagrams.find({ projectId: projectId }).count();
    const meetingCount = Meetings.find({
      projectId: projectId,
      deleted: { $ne: true }
    }).count();
    const canvas = Canvas.findOne({ projectId: projectId });
    let canvasProgression = 0;
    if (canvas && canvas.data) {
      let itemCount = 0;
      let itemCompleted = 0;
      Object.keys(canvas.data).forEach((item) => {
        itemCount += 1;
        if (canvas.data[item].length > 0) {
          itemCompleted += 1;
        }
      });
      if (itemCount > 0) {
        canvasProgression = Math.trunc(100 * (itemCompleted / itemCount));
      }
    }

    const healthReport = HealthReports.findOne(
      { projectId: projectId },
      {
        sort: {
          date: -1
        }
      }
    );

    return {
      taskCount: taskCount,
      completedTaskCount: completedTaskCount,
      meetingCount: meetingCount,
      userCount: userCount,
      diagramCount: diagramCount,
      canvasProgression: canvasProgression,
      healthReport: healthReport
    };
  }
});

Projects.methods.adminFind = new ValidatedMethod({
  name: "admin.findProjects",
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
    const count = Projects.find(query).count();

    const data = Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

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

    data.forEach((project) => {
      project.createdBy = loadUser(project.createdBy);
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

const projectOrOrganizationRequired = function () {
  if (!this.field("projectId").value && !this.field("organizationId").value) {
    return SimpleSchema.ErrorTypes.REQUIRED;
  }
  return true;
};
Projects.methods.findUsers = new ValidatedMethod({
  name: "projects.findUsers",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: true,
      custom: projectOrOrganizationRequired
    },
    organizationId: {
      type: String,
      optional: true,
      custom: projectOrOrganizationRequired
    },
    filter: { type: String, optional: true },
    usersIds: { type: Array, optional: true },
    "usersIds.$": {
      type: String
    }
  }).validator(),
  run({ projectId, organizationId, filter, usersIds }) {
    checkLoggedIn();
    let membersIds = [];
    const projectQuery = {};
    if (projectId) {
      projectQuery._id = projectId;
    }
    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }
    const projects = Projects.find(projectQuery).fetch();
    if (!projects || !Array.isArray(projects) || !projects.length) {
      return [];
    }
    projects.forEach((project) => {
      membersIds = membersIds.concat(findProjectMembersIds(project));
    });
    membersIds = [...new Set(membersIds)];
    if (usersIds && Array.isArray(usersIds) && usersIds.length) {
      membersIds = membersIds.filter((memberId) => usersIds.includes(memberId));
    }

    const query = { _id: { $in: membersIds } };
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: "i" }
        }
      };
      query.$or = [
        { emails },
        {
          "profile.email": { $regex: `.*${filter}.*`, $options: "i" }
        },
        {
          "profile.firstName": { $regex: `.*${filter}.*`, $options: "i" }
        },
        {
          "profile.lastName": { $regex: `.*${filter}.*`, $options: "i" }
        }
      ];
    }

    return Meteor.users
      .find(query, {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1
        }
      })
      .fetch();
  }
});

Projects.methods.adminMigrateFeatures = new ValidatedMethod({
  name: "admin.projectsMigrateFeatures",
  validate: null,
  run() {
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const hasMeetings = (project) => Meetings.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasBPMN = (project) => ProcessDiagrams.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasCanvas = (project) => Canvas.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasWeather = (project) => HealthReports.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const projects = Projects.find({ deleted: { $ne: true } }, {
      fields: { _id: 1 }
    });
    projects.forEach((project) => {
      if (hasMeetings(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "meetings"
        });
      }
      if (hasBPMN(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "bpmn"
        });
      }
      if (hasCanvas(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "canvas"
        });
      }
      if (hasWeather(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "weather"
        });
      }
    });
  }
});
