import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Tasks } from "/imports/api/tasks/tasks";
import { Projects } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import { Permissions, checkLoggedIn, checkCanReadProject, checkCanWriteProject } from "/imports/api/permissions/permissions"

HealthReports.methods.findTasks = new ValidatedMethod({
  name: "healthReports.findTasks",
  validate: new SimpleSchema({
    id: { type: String },
    page: { type: Number },
  }).validator(),
  run({ id, page }) {
    checkLoggedIn();

    const report = HealthReports.findOne({ _id: id });
    const project = Projects.findOne({ _id: report.projectId });
    const projectId = project._id

    checkCanReadProject(projectId);

    let organization;
    if (project.organizationId) organization = Organizations.findOne({ _id: project.organizationId });
    const currentDate = report.date;
    let previousDate = null;
    const previous = HealthReports.findOne({
      projectId: projectId,
      date: { $lt: report.date },
    }, {
      sort: {
        date: -1
      }
    });

    if (previous) previousDate = previous.date;

    const perPage = 250;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    let query = {
      completed: true,
      projectId: projectId,
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
      skip: skip,
      limit: perPage,
      sort: {
        updatedAt: -1
      }
    }).fetch();

    // load associated objects and assign them to tasks
    const users = {};

    const loadUser = userId => {
      let user = users[userId];
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

    data.map(task => {
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
      data: data
    };
  }
});


HealthReports.methods.findHealthReports = new ValidatedMethod({
  name: "healthReports.findHealthReports",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number },
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
    let query = {
      projectId: projectId,
    };

    const count = HealthReports.find(query).count();
    const data = HealthReports.find(query, {
      skip: skip,
      limit: perPage,
      sort: {
        date: -1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  }
});
