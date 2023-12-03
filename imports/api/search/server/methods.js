import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
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
    page: { type: Number, optional: true },
    showArchivedProjects: { type: Boolean, optional: true }
  }).validator(),
  async run({ organizationId, projectId, name, page, showArchivedProjects }) {
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
    if (!showArchivedProjects) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }

    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }
    if (projectId) {
      await checkCanReadProject(projectId);
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

    // filter by name
    if (name && name.length > 0) {
      taskQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get tasks
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
        task.assignedTo = loadUser(task.assignedTo);
      }
      if (task.createdBy) {
        task.createdBy = loadUser(task.createdBy);
      }
      loadedData.push(task);
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

methods.findProjects = new ValidatedMethod({
  name: "search.findProjects",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true },
    showArchivedProjects: { type: Boolean, optional: true }
  }).validator(),
  async run({ organizationId, name, page, showArchivedProjects }) {
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

    if (!showArchivedProjects) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }

    if (isRegularUser) {
      projectQuery.members = userId;
    }

    // filter by name
    if (name && name.length > 0) {
      projectQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    const favoriteProjectIds = user.profile?.favoriteProjects || [];

    const count = await Projects.find(projectQuery).countAsync();
    const favoriteCount = await Projects.find({
      ...projectQuery,
      _id: {
        $in: favoriteProjectIds
      }
    }).countAsync();

    // get favorite projects
    let data = await Projects.find(
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
    ).fetchAsync();

    if (data.length < perPage) {
      // get regular projects if slots are still available
      let newSkip = skip - favoriteCount; // recaculate skip for regular projects
      if (newSkip < 0) newSkip = 0;
      const regularProjects = await Projects.find({
        ...projectQuery,
        _id: {
          $nin: favoriteProjectIds
        }
      }, {
        skip: newSkip,
        limit: perPage - data.length,
        sort
      }).fetchAsync();
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
  async run({ name, page }) {
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
    const count = await Organizations.find(organizationQuery).countAsync();
    const data = await Organizations.find(organizationQuery, {
      skip,
      limit: perPage,
      sort
    }).fetchAsync();

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
    page: { type: Number, optional: true },
    showArchivedProjects: { type: Boolean, optional: true }
  }).validator(),
  async run({ projectId, name, page, showArchivedProjects }) {
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
    if (!showArchivedProjects) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }

    if (projectId) {
      await checkCanReadProject(projectId);
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
    attachmentQuery["meta.projectId"] = { $in: projectIds };

    // filter by name
    if (name && name.length > 0) {
      attachmentQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get attachments
    const count = await Attachments.find(attachmentQuery).count();
    const data = await Attachments.find(attachmentQuery, {
      skip,
      limit: perPage,
      sort
    }).fetch();

    // load associated objects and assign them to attachments
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

    // Collect all promises
    const promises = data.map(async (attachment) => {
      const attachmentProjectId = attachment?.meta?.projectId ? attachment.meta.projectId : null;
      if (attachmentProjectId) {
        let project = projects[attachmentProjectId];
        if (!project) {
          projects[attachmentProjectId] = await Projects.findOneAsync({ _id: attachmentProjectId });
          project = projects[attachmentProjectId];
        }
        if (project) {
          attachment.project = project;
          let organization = organizations[project.organizationId];
          if (!organization) {
            organizations[project.organizationId] = await Organizations.findOneAsync({
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
        attachment.createdBy = await loadUser(attachment.createdBy);
      }

      // Return the modified attachment
      return attachment;
    });

    const loadedData = await Promise.all(promises);

    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data: loadedData
    };
  }
});

methods.findMeetings = new ValidatedMethod({
  name: "search.findMeetings",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    projectId: { type: String, optional: true },
    name: { type: String },
    page: { type: Number, optional: true },
    showArchivedProjects: { type: Boolean, optional: true }
  }).validator(),
  async run({ organizationId, projectId, name, page, showArchivedProjects }) {
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
    if (!showArchivedProjects) {
      projectQuery.state = {
        $ne: ProjectStates.ARCHIVED
      };
    }

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
    const projectIds = await Projects.find(projectQuery, {
      fields: {
        _id: 1
      }
    }).mapAsync(async (project) => project._id);
    meetingQuery.projectId = { $in: projectIds };

    // filter by name
    if (name && name.length > 0) {
      meetingQuery.name = { $regex: `.*${name}.*`, $options: "i" };
    }

    // get meetings
    const count = await Meetings.find(meetingQuery).countAsync();
    const data = await Meetings.find(meetingQuery, {
      skip,
      limit: perPage,
      sort
    });

    // load associated objects and assign them to meetings
    const projects = {};
    const organizations = {};

    const loadedData = [];
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
          organizations[project.organizationId] = Organizations.findOne({
            _id: project.organizationId
          });
          organization = organizations[project.organizationId];
        }
        if (organization) {
          meeting.organization = organization;
        }
      }
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

export default methods;
