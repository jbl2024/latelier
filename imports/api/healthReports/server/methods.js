import { Meteor } from "meteor/meteor";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Tasks } from "/imports/api/tasks/tasks";
import { Projects } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";
import moment from "moment";

HealthReports.methods.create = new ValidatedMethod({
  name: "healthReports.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: {
      type: String,
      optional: true
    },
    date: { type: String },
    weather: { type: String },
    reportUserId: {
      type: String,
      optional: true
    }
  }).validator(),
  run: async function ({ projectId, name, description, date, weather, reportUserId }) {
    checkLoggedIn();
    await checkCanWriteProject(projectId);

    let userId = Meteor.userId();
    const canSelectUserId = reportUserId && Meteor.isServer && Permissions.isAdmin(userId);
    userId = canSelectUserId ? reportUserId : userId;

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = await HealthReports.insertAsync({
      projectId,
      name,
      description,
      date: convertedDate,
      weather,
      createdAt: new Date(),
      createdBy: userId
    });

    return reportId;
  }
});

HealthReports.methods.update = new ValidatedMethod({
  name: "healthReports.update",
  validate: new SimpleSchema({
    id: { type: String },
    name: { type: String },
    description: { type: String, optional: true },
    date: { type: String },
    weather: { type: String }
  }).validator(),
  run: async function ({ id, name, description, date, weather }) {
    checkLoggedIn();

    const report = await HealthReports.findOneAsync({ _id: id });
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(report.projectId);

    if (description == null) {
      description = report.description;
    }

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = await HealthReports.updateAsync(
      {
        _id: id
      },
      {
        $set: {
          name,
          description,
          date: convertedDate,
          weather,
          createdAt: new Date(),
          createdBy: Meteor.userId()
        }
      }
    );

    return reportId;
  }
});

HealthReports.methods.updateDescription = new ValidatedMethod({
  name: "healthReports.updateDescription",
  validate: new SimpleSchema({
    id: { type: String },
    description: { type: String }
  }).validator(),
  run: async function ({ id, description }) {
    checkLoggedIn();

    const report = await HealthReports.findOneAsync({ _id: id });
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(report.projectId);

    const reportId = await HealthReports.updateAsync(
      {
        _id: id
      },
      {
        $set: {
          description
        }
      }
    );

    return reportId;
  }
});

HealthReports.methods.remove = new ValidatedMethod({
  name: "healthReports.remove",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),
  run: async function({ id }) {
    checkLoggedIn();

    const report = await HealthReports.findOneAsync({ _id: id });
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(report.projectId);
    await HealthReports.removeAsync(id);
  }
});

HealthReports.methods.findTasks = new ValidatedMethod({
  name: "healthReports.findTasks",
  validate: new SimpleSchema({
    id: { type: String },
    page: { type: Number }
  }).validator(),
  run: async function ({ id, page }) {
    checkLoggedIn();

    const report = await HealthReports.findOneAsync({ _id: id });
    const project = await Projects.findOneAsync({ _id: report.projectId });
    const projectId = project._id;

    checkCanReadProject(projectId);

    let organization;
    if (project.organizationId) {
      organization = await Organizations.findOneAsync({ _id: project.organizationId });
    }
    const currentDate = moment(report.date).add(1, "days").startOf("day").toDate();

    let previousDate = null;
    const previous = await HealthReports.findOneAsync(
      {
        projectId,
        date: { $lt: report.date }
      },
      {
        sort: {
          date: -1
        }
      }
    );

    if (previous) previousDate = moment(previous.date).add(1, "days").startOf("day").toDate();

    const perPage = 250;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {
      completed: true,
      projectId,
      completedAt: {
        $lte: currentDate
      },
      deleted: { $ne: true }
    };
    if (previousDate) {
      query.completedAt = {
        $lte: currentDate,
        $gte: previousDate
      };
    } else {
      query.completedAt = {
        $lte: currentDate
      };
    }

    const count = await Tasks.find(query).countAsync();
    const data = await Tasks.find(query, {
      skip,
      limit: perPage,
      sort: {
        updatedAt: -1
      }
    });

    // load associated objects and assign them to tasks
    const users = {};

    const loadUser = async (userId) => {
      const user = users[userId];
      if (user) {
        return user;
      }
      users[userId] = await Meteor.users.findOneAsync(
        { _id: userId },
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
      return users[userId];
    };

    const loadedData = [];
    data.forEachAsync(async (task) => {
      if (project) {
        task.project = project;
        task.organization = organization;
      }

      if (task.assignedTo) {
        task.assignedTo = await loadUser(task.assignedTo);
      }
      if (task.createdBy) {
        task.createdBy = await loadUser(task.createdBy);
      }
      loadedData.push(task);
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: loadedData
    };
  }
});

HealthReports.methods.findHealthReports = new ValidatedMethod({
  name: "healthReports.findHealthReports",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number }
  }).validator(),
  run: async function({ projectId, page }) {
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

    const count = await HealthReports.find(query).countAsync();
    const data = await HealthReports.find(query, {
      skip,
      limit: perPage,
      sort: {
        date: -1
      }
    }).fetchAsync();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

HealthReports.methods.get = new ValidatedMethod({
  name: "healthReports.get",
  validate: new SimpleSchema({
    healthReportId: { type: String }
  }).validator(),
  run: async function({ healthReportId }) {
    checkLoggedIn();
    const healthReport = await HealthReports.findOneAsync({ _id: healthReportId });
    if (healthReport) {
      checkCanReadProject(healthReport.projectId);
    } else {
      throw new Meteor.Error("not-found");
    }
    return healthReport;
  }
});
