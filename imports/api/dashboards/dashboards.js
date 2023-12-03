import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Projects, ProjectStates } from "/imports/api/projects/projects.js";
import {
  Permissions,
  checkLoggedIn
} from "/imports/api/permissions/permissions";

Meteor.methods({
  "dashboards.findTasks": async function(type, organizationId, projectId, page, showArchivedProjects) {
    check(type, String);
    check(organizationId, Match.Maybe(String));
    check(projectId, Match.Maybe(String));
    check(page, Match.Maybe(Number));
    check(showArchivedProjects, Match.Maybe(Boolean));
    checkLoggedIn();

    const perPage = 25;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const userId = Meteor.userId();
    const isRegularUser = !Permissions.isAdmin(userId);

    const taskQuery = {
      completed: false,
      deleted: { $ne: true }
    };
    let sort = {};

    const projectQuery = {
      deleted: { $ne: true }
    };

    if (!showArchivedProjects) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }

    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }

    if (projectId) {
      projectQuery._id = projectId;
    }

    if (isRegularUser) {
      projectQuery.members = userId;
    }

    const projectIds = await Projects.find(projectQuery, {
      fields: {
        _id: 1
      }
    }).mapAsync(async (project) => project._id);

    taskQuery.projectId = { $in: projectIds };

    if (type === "recent") {
      sort = {
        updatedAt: -1
      };
    } else if (type === "assignedToMe") {
      taskQuery.assignedTo = userId;
      sort = {
        updatedAt: -1
      };
    } else if (type === "late") {
      taskQuery.dueDate = {
        $lte: new Date()
      };
      sort = {
        dueDate: 1
      };
    }

    const count = await Tasks.find(taskQuery).countAsync();
    const data = await Tasks.find(taskQuery, {
      skip,
      limit: perPage,
      sort
    });

    // load associated objects and assign them to tasks
    const projects = {};
    const users = {};
    const organizations = {};

    const loadUser = async (aUserId) => {
      const aUser = users[aUserId];
      if (aUser) {
        return aUser;
      }
      users[aUserId] = await Meteor.users.findOneAsync(
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
      return users[aUserId];
    };

    const loadedData = [];
    data.forEachAsync(async (task) => {
      let project = projects[task.projectId];
      if (!project) {
        projects[task.projectId] = await Projects.findOneAsync({ _id: task.projectId });
        project = projects[task.projectId];
      }
      if (project) {
        task.project = project;

        let organization = organizations[project.organizationId];
        if (!organization) {
          organizations[project.organizationId] = await Organizations.findOneAsync({
            _id: project.organizationId
          });
          organization = organizations[project.organizationId];
        }
        if (organization) {
          task.organization = organization;
        }
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
