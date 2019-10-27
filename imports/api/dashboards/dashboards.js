import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";

Meteor.methods({
  "dashboards.findTasks"(user, type, organizationId, page) {
    check(user, Object);
    check(type, String);
    check(organizationId, Match.Maybe(String));
    check(page, Match.Maybe(Number));

    const userId = Meteor.userId();

    const perPage = 25;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {
      completed: false,
      deleted: { $ne: true }
    };

    if (!Permissions.isAdmin(userId)) {
      if (organizationId) {
        const organizationCount = Organizations.find(
          { $or: [{ members: userId }, { isPublic: true }] },
          { fields: { _id: 1 } }
        ).count();
        if (organizationCount > 0) {
          const projectIds = Projects.find({
            organizationId,
            members: userId,
            deleted: { $ne: true }
          }).map((project) => project._id);
          query.projectId = { $in: projectIds };
        }
      } else {
        const organizations = Organizations.find(
          { $or: [{ members: userId }, { isPublic: true }] },
          { fields: { _id: 1 } }
        ).fetch();
        const organizationIds = [];
        organizations.forEach((organization) => {
          if (organizationId) {
            if (organization._id !== organizationId) {
              return;
            }
          }
          organizationIds.push(organization._id);
        });

        const projects = Projects.find(
          {
            deleted: { $ne: true },
            $or: [
              { organizationId: { $in: organizationIds } },
              { organizationId: { $exists: false } },
              { members: userId }
            ]
          },
          { fields: { _id: 1 } }
        ).fetch();
        const projectIds = [];
        projects.forEach((project) => {
          projectIds.push(project._id);
        });
        query.projectId = { $in: projectIds };
      }
    } else if (organizationId) {
      const projectIds = Projects.find({
        organizationId,
        deleted: { $ne: true }
      }).map((project) => project._id);
      query.projectId = { $in: projectIds };
    } else {
      const deletedProjectIds = Projects.find({ deleted: true }).map(
        (project) => project._id
      );
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
      skip,
      limit: perPage,
      sort
    }).fetch();

    // load associated objects and assign them to tasks
    const projects = {};
    const users = {};
    const organizations = {};

    const loadUser = (aUserId) => {
      const aUser = users[aUserId];
      if (aUser) {
        return aUser;
      }
      users[aUserId] = Meteor.users.findOne(
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

    data.forEach((task) => {
      let project = projects[task.projectId];
      if (!project) {
        projects[task.projectId] = Projects.findOne({ _id: task.projectId });
        project = projects[task.projectId];
      }
      if (project) {
        task.project = project;

        let organization = organizations[project.organizationId];
        if (!organization) {
          organizations[project.organizationId] = Organizations.findOne({
            _id: project.organizationId
          });
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
      data
    };
  }
});
