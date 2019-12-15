import { Meteor } from "meteor/meteor";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Tasks } from "/imports/api/tasks/tasks";
import { Projects } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import {
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
    description: { type: String },
    date: { type: String },
    weather: { type: String }
  }).validator(),
  run({ projectId, name, description, date, weather }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = HealthReports.insert({
      projectId,
      name,
      description,
      date: convertedDate,
      weather,
      createdAt: new Date(),
      createdBy: Meteor.userId()
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
  run({ id, name, description, date, weather }) {
    checkLoggedIn();

    const report = HealthReports.findOne({ _id: id });
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(report.projectId);

    if (description == null) {
      description = report.description;
    }

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();
    const reportId = HealthReports.update(
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

HealthReports.methods.remove = new ValidatedMethod({
  name: "healthReports.remove",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),
  run({ id }) {
    checkLoggedIn();

    const report = HealthReports.findOne({ _id: id });
    if (!report) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(report.projectId);
    HealthReports.remove(id);
  }
});

HealthReports.methods.findTasks = new ValidatedMethod({
  name: "healthReports.findTasks",
  validate: new SimpleSchema({
    id: { type: String },
    page: { type: Number }
  }).validator(),
  run({ id, page }) {
    checkLoggedIn();

    const report = HealthReports.findOne({ _id: id });
    const project = Projects.findOne({ _id: report.projectId });
    const projectId = project._id;

    checkCanReadProject(projectId);

    let organization;
    if (project.organizationId) {
      organization = Organizations.findOne({ _id: project.organizationId });
    }
    const currentDate = moment(report.date).add(1, "days").startOf("day");

    let previousDate = null;
    const previous = HealthReports.findOne(
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

    if (previous) previousDate = previous.date;

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

    const count = Tasks.find(query).count();
    const data = Tasks.find(query, {
      skip,
      limit: perPage,
      sort: {
        updatedAt: -1
      }
    }).fetch();

    // load associated objects and assign them to tasks
    const users = {};

    const loadUser = (userId) => {
      const user = users[userId];
      if (user) {
        return user;
      }
      users[userId] = Meteor.users.findOne(
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

    data.forEach((task) => {
      if (project) {
        task.project = project;
        task.organization = organization;
      }

      if (task.assignedTo) {
        task.assignedTo = loadUser(task.assignedTo);
      }
      if (task.createdBy) {
        task.createdBy = loadUser(task.createdBy);
      }
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

HealthReports.methods.findHealthReports = new ValidatedMethod({
  name: "healthReports.findHealthReports",
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

    const count = HealthReports.find(query).count();
    const data = HealthReports.find(query, {
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
