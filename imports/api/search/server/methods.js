import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

const methods = {};

methods.findTasks = new ValidatedMethod({
  name: "search.findTasks",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true }
  }).validator(),
  run({ organizationId, projectId, name, page }) {
    checkLoggedIn();

    /* eslint no-console: off */
    console.log("search.findTasks");
    const userId = Meteor.userId();
    const isRegularUser = !Permissions.isAdmin(userId);

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const taskQuery = {
      deleted: { $ne: true }
    };
    const sort = { updatedAt: -1 };


    // get projects
    const projectQuery = {
      deleted: { $ne: true }
    };
    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }
    if (projectId) {
      checkCanReadProject(projectId);
      projectQuery._id = projectId;
    }
    if (isRegularUser) {
      projectQuery.members = userId;
    }
    const projectIds = Projects.find(projectQuery, {
      fields: {
        _id: 1
      }
    }).map((project) => project._id);
    taskQuery.projectId = { $in: projectIds };

    // filter by name
    if (name && name.length > 0) {
      taskQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get tasks
    const count = Tasks.find(taskQuery).count();
    const data = Tasks.find(taskQuery, {
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

export default methods;
