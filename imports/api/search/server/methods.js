import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import { Attachments } from "/imports/api/attachments/attachments";
import { Meetings } from "/imports/api/meetings/meetings";
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

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});

methods.findProjects = new ValidatedMethod({
  name: "search.findProjects",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true }
  }).validator(),
  run({ organizationId, name, page }) {
    checkLoggedIn();

    const user = Meteor.user();
    const userId = Meteor.userId();
    const isRegularUser = !Permissions.isAdmin(userId);
    const sort = { name: 1 };

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const projectQuery = {
      deleted: { $ne: true }
    };
    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }

    if (isRegularUser) {
      projectQuery.members = userId;
    }

    // filter by name
    if (name && name.length > 0) {
      projectQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    const favoriteProjectIds = user.profile?.favoriteProjects || [];

    const count = Projects.find(projectQuery).count();
    const favoriteCount = Projects.find({
      ...projectQuery,
      _id: {
        $in: favoriteProjectIds
      }
    }).count();

    // get favorite projects
    let data = Projects.find(
      {
        ...projectQuery,
        _id: {
          $in: favoriteProjectIds
        }
      }, {
        skip,
        limit: perPage,
        sort
      }
    ).fetch();

    if (data.length < perPage) {
      // get regular projects if slots are still available
      let newSkip = skip - favoriteCount; // recaculate skip for regular projects
      if (newSkip < 0) newSkip = 0;
      const regularProjects = Projects.find({
        ...projectQuery,
        _id: {
          $nin: favoriteProjectIds
        }
      }, {
        skip: newSkip,
        limit: perPage - data.length,
        sort
      }).fetch();
      data = data.concat(regularProjects);
    }

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});

methods.findOrganizations = new ValidatedMethod({
  name: "search.findOrganizations",
  validate: new SimpleSchema({
    name: { type: String },
    page: { type: Number, optional: true }
  }).validator(),
  run({ name, page }) {
    checkLoggedIn();

    const userId = Meteor.userId();
    const isRegularUser = !Permissions.isAdmin(userId);
    const sort = { updatedAt: -1 };

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const organizationQuery = {
      deleted: { $ne: true }
    };

    if (isRegularUser) {
      organizationQuery.members = userId;
    }

    // filter by name
    if (name && name.length > 0) {
      organizationQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    // get organizations
    const count = Organizations.find(organizationQuery).count();
    const data = Organizations.find(organizationQuery, {
      skip,
      limit: perPage,
      sort
    }).fetch();

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});

methods.findAttachments = new ValidatedMethod({
  name: "search.findAttachments",
  validate: new SimpleSchema({
    projectId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true }
  }).validator(),
  run({ projectId, name, page }) {
    checkLoggedIn();

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

    const attachmentQuery = {};
    const sort = { updatedAt: -1 };

    // get projects
    const projectQuery = {
      deleted: { $ne: true }
    };
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
    attachmentQuery["meta.projectId"] = { $in: projectIds };

    // filter by name
    if (name && name.length > 0) {
      attachmentQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get attachments
    const count = Attachments.find(attachmentQuery).count();
    const data = Attachments.find(attachmentQuery, {
      skip,
      limit: perPage,
      sort
    }).fetch();

    // load associated objects and assign them to attachments
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

    data.forEach((attachment) => {
      const attachmentProjectId = attachment?.meta?.projectId ? attachment.meta.projectId : null;
      if (attachmentProjectId) {
        let project = projects[attachmentProjectId];
        if (!project) {
          projects[attachmentProjectId] = Projects.findOne({ _id: attachmentProjectId });
          project = projects[attachmentProjectId];
        }
        if (project) {
          attachment.project = project;
          let organization = organizations[project.organizationId];
          if (!organization) {
            organizations[project.organizationId] = Organizations.findOne({
              _id: project.organizationId
            });
            organization = organizations[project.organizationId];
          }
          if (organization) {
            attachment.organization = organization;
          }
        }
      }
      if (attachment.createdBy) {
        attachment.createdBy = loadUser(attachment.createdBy);
      }
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

methods.findMeetings = new ValidatedMethod({
  name: "search.findMeetings",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true }
  }).validator(),
  run({ organizationId, projectId, name, page }) {
    checkLoggedIn();

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

    const meetingQuery = {
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
    meetingQuery.projectId = { $in: projectIds };

    // filter by name
    if (name && name.length > 0) {
      meetingQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get meetings
    const count = Meetings.find(meetingQuery).count();
    const data = Meetings.find(meetingQuery, {
      skip,
      limit: perPage,
      sort
    }).fetch();

    // load associated objects and assign them to meetings
    const projects = {};
    const organizations = {};

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

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});

export default methods;
