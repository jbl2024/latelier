import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";


Meteor.methods({
  "dashboards.findTasks"(user, type, page) {
    const userId = Meteor.userId();

    const perPage = 25;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    let query = {
      completed: false
    };

    if (!Permissions.isAdmin(userId)) {
      const organizations = Organizations.find(
        { $or: [{ members: userId }, { isPublic: true }] },
        { fields: { _id: 1 } }
      ).fetch();
      const organizationIds = [];
      organizations.map(organization => {
        organizationIds.push(organization._id);
      });

      const projects = Projects.find(
        {
          deleted: {$ne: true},
          $or: [{organizationId: { $in: organizationIds }}, {organizationId: {$exists: false}}],
          $or: [{ createdBy: userId }, { members: userId }]
        },
        { fields: { _id: 1 } }
      ).fetch();
      const projectIds = [];
      projects.map(project => {
        projectIds.push(project._id);
      });
      query.projectId = { $in: projectIds };
    } else {
      const deletedProjectIds = Projects.find({deleted: true}).map(project => { return project._id});
      query.projectId = { $nin: deletedProjectIds };
    }

    let sort = {};

    const count = Tasks.find(query).count();
    if (type === "recent") {
      sort = {
        updatedAt: -1
      };
    } else if (type === "assignedToMe") {
      query.assignedTo = user._id;

      sort = {
        updatedAt: -1
      };
    } else if (type === "late") {
      query.dueDate = {
        $lte: new Date()
      };
      sort = {
        dueDate: 1
      };
    }

    const data = Tasks.find(query, {
      skip: skip,
      limit: perPage,
      sort: sort
    }).fetch();

    // load associated objects and assign them to tasks
    const projects = {};
    const users = {};
    const organizations = {};

    const loadUser = (userId) => {
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
      let project = projects[task.projectId];
      if (!project) {
        projects[task.projectId] = Projects.findOne({ _id: task.projectId });
        project = projects[task.projectId];
      }
      if (project) {
        task.project = project;

        let organization = organizations[project.organizationId];
        if (!organization) {
          organizations[project.organizationId] = Organizations.findOne({_id: project.organizationId});
          organization = organizations[project.organizationId];
        }
        if (organization) {
          task.organization = organization;
        }
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
