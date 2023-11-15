import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams.js";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import { Meetings } from "/imports/api/meetings/meetings.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import { Labels } from "/imports/api/labels/labels.js";
import { Events } from "/imports/api/events/events.js";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";
import { UserUtils } from "/imports/api/users/utils";
import ProjectSchema from "./schema";

export const Projects = new Mongo.Collection("projects");
Projects.attachSchema(ProjectSchema);
Projects.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Projects.rawCollection().createIndex({ organizationId: 1 });
    Projects.rawCollection().createIndex({ deleted: 1 });
    Projects.rawCollection().createIndex({ state: 1 });
  });
}

export const ProjectStates = Object.freeze({
  PLANNED: "planned",
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  ARCHIVED: "archived",
  IMPORTING: "importing",
  ERROR: "error"
});

export const ProjectVisibleStates = Object.entries(ProjectStates).reduce((projectStates, entry) => {
  [key, value] = entry;
  if (!["IMPORTING", "ERROR"].includes(key)) {
    projectStates[key] = value;
  }
  return projectStates;
}, {});

export const ProjectAccessRights = Object.freeze({
  ORGANIZATION: "organization",
  PRIVATE: "private"
});

export const ProjectExportVersions = Object.freeze({
  V2020_11: "V2020_11"
});

const checkIfAdminOrCreator = async (projectId) => {
  if (Permissions.isAdmin(Meteor.userId())) {
    return true;
  }
  if (Permissions.isAdmin(Meteor.userId(), projectId)) {
    return true;
  }
  const project = await Projects.findOneAsync(projectId);
  if (project.createdBy === Meteor.userId()) {
    return true;
  }
  throw new Meteor.Error("not-authorized");
};

const checkIfAdmin = (projectId) => {
  if (Permissions.isAdmin(Meteor.userId())) {
    return true;
  }
  if (Permissions.isAdmin(Meteor.userId(), projectId)) {
    return true;
  }
  throw new Meteor.Error("not-authorized");
};

Projects.methods.insert = new ValidatedMethod({
  name: "projects.insert",
  validate: new SimpleSchema({
    organizationId: { type: String },
    name: { type: String }
  }).validator(),
  run({ organizationId, name }) {
    checkLoggedIn();

    const project = Projects.insert({
      organizationId,
      name,
      state: ProjectStates.DEVELOPMENT,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return project;
  }
});

Projects.methods.remove = new ValidatedMethod({
  name: "projects.remove",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);

    Projects.update(
      { _id: projectId },
      {
        $set: {
          deleted: true,
          deletedBy: Meteor.userId(),
          deletedAt: new Date()
        }
      }
    );

    Meteor.users.update(
      {},
      { $pull: { "profile.favoriteProjects": projectId, "profile.digests": projectId } },
      { multi: true }
    );
  }
});

Projects.methods.deleteForever = new ValidatedMethod({
  name: "projects.deleteForever",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);

    Tasks.remove({ projectId });
    Lists.remove({ projectId });
    Labels.remove({ projectId });
    ProcessDiagrams.remove({ projectId });
    HealthReports.remove({ projectId });
    Meetings.remove({ projectId });
    Canvas.remove({ projectId });
    Attachments.remove({ "meta.projectId": projectId });
    Meteor.call("events.removeProject", projectId);
    Meteor.users.update(
      {},
      { $pull: { "profile.favoriteProjects": projectId, "profile.digests": projectId } },
      { multi: true }
    );
    const projectGroups = ProjectGroups.find({ projects: projectId });
    projectGroups.forEach((projectGroup) => {
      Meteor.call("projectGroups.removeProject", projectGroup._id, projectId);
    });

    const query = {};
    query[`roles.${projectId}`] = { $exists: true };
    const update = { $unset: {} };
    update.$unset[`roles.${projectId}`] = 1;
    Meteor.users.update(query, update, { multi: true });
    Projects.remove(projectId);
  }
});

Projects.methods.restore = new ValidatedMethod({
  name: "projects.restore",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    await checkCanWriteProject(projectId);

    await Projects.updateAsync(
      { _id: projectId },
      {
        $set: {
          deleted: false
        }
      }
    );
  }
});

Projects.methods.updateName = new ValidatedMethod({
  name: "projects.updateName",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String }
  }).validator(),
  async run({ projectId, name }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);

    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }
    await Projects.updateAsync({ _id: projectId }, { $set: { name } });
  }
});

Projects.methods.updateDescription = new ValidatedMethod({
  name: "projects.updateDescription",
  validate: new SimpleSchema({
    projectId: { type: String },
    description: { type: String }
  }).validator(),
  async run({ projectId, description }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);
    if (description.length === 0) {
      throw new Meteor.Error("invalid-description");
    }

    await Projects.updateAsync({ _id: projectId }, { $set: { description } });
  }
});

Projects.methods.updateStates = new ValidatedMethod({
  name: "projects.updateState",
  validate: new SimpleSchema({
    projectId: { type: String },
    state: { type: String }
  }).validator(),
  async run({ projectId, state }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);

    if (state.length === 0) {
      throw new Meteor.Error("invalid-state");
    }

    await Projects.updateAsync({ _id: projectId }, { $set: { state } });
  }
});

Projects.methods.updateColor = new ValidatedMethod({
  name: "projects.updateColor",
  validate: new SimpleSchema({
    projectId: { type: String },
    color: { type: String }
  }).validator(),
  async run({ projectId, color }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);
    await Projects.updateAsync({ _id: projectId }, { $set: { color } });
  }
});

Projects.methods.updateIsPublic = new ValidatedMethod({
  name: "projects.updateIsPublic",
  validate: new SimpleSchema({
    projectId: { type: String },
    isPublic: { type: Boolean }
  }).validator(),
  async run({ projectId, isPublic }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);
    await Projects.updateAsync({ _id: projectId }, { $set: { isPublic } });
  }
});

Projects.methods.updateAccessRights = new ValidatedMethod({
  name: "projects.updateAccessRights",
  validate: new SimpleSchema({
    projectId: { type: String },
    accessRights: { type: String }
  }).validator(),
  async run({ projectId, accessRights }) {
    checkLoggedIn();
    await checkIfAdmin(projectId);

    const project = await Projects.findOneAsync({ _id: projectId });
    if (!project) {
      throw new Meteor.Error("invalid-project");
    }
    await Projects.updateAsync({ _id: projectId }, { $set: { accessRights } });

    if (
      accessRights === ProjectAccessRights.ORGANIZATION
      && project.organizationId
    ) {
      await Meteor.callAsync("organizations.propagateMembership", {
        organizationId: project.organizationId,
        projectId: project._id
      });
    }
  }
});

Projects.methods.clone = new ValidatedMethod({
  name: "projects.clone",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    await checkCanReadProject(projectId);
    const project = await Projects.findOneAsync(projectId);
    if (!project) {
      throw new Meteor.Error("invalid-project");
    }

    const newProjectId = await Projects.insertAsync({
      name: `Copie de ${project.name}`,
      organizationId: project.organizationId,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      state: project.state,
      startDate: project.startDate,
      members: project.members,
      endDate: project.endDate,
      color: project.color,
      features: project.features
    });

    const newProject = await Projects.findOneAsync(newProjectId);
    if (!newProject) {
      throw new Meteor.Error("invalid-new-project");
    }

    const projectGroups = ProjectGroups.find({ projects: projectId });
    await projectGroups.forEachAsync(async (projectGroup) => {
      await Meteor.callAsync("projectGroups.addProject", projectGroup._id, newProjectId);
    });

    const labels = await Labels.find({ projectId });
    await labels.forEachAsync(async (label) => {
      await Meteor.callAsync("labels.create", {
        projectId: newProjectId,
        name: label.name,
        color: label.color
      });
    });

    const lists = Lists.find({ projectId });
    await lists.forEachAsync(async (list) => {
      const newListId = await Lists.insertAsync({
        name: list.name,
        order: list.order,
        projectId: newProjectId,
        createdAt: new Date(),
        createdBy: Meteor.userId()
      });

      const tasks = Tasks.find({ listId: list._id });
      await tasks.forEachAsync(async (task) => {
        await Meteor.callAsync(
          "tasks.clone",
          task._id,
          task.name,
          newProjectId,
          newListId,
          true /* keepDates */
        );
      });
    });

    await Meteor.callAsync("permissions.initializeProjectPermissions", {
      projectId: newProjectId
    });

    return newProjectId;
  }
});

Projects.methods.addMember = new ValidatedMethod({
  name: "projects.addMember",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);

    if (await Projects.find({ _id: projectId, members: userId }).countAsync() > 0) {
      return;
    }
    const project = await Projects.findOneAsync({ _id: projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }
    await Projects.updateAsync({ _id: projectId }, { $push: { members: userId } });
  }
});

Projects.methods.removeMember = new ValidatedMethod({
  name: "projects.removeMember",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);

    if (await Projects.find({ _id: projectId, members: userId }).countAsync() === 0) {
      return;
    }
    await Projects.updateAsync({ _id: projectId }, { $pull: { members: userId } });
    await Tasks.updateAsync(
      { projectId, assignedTo: userId },
      { $set: { assignedTo: null } },
      { multi: true }
    );

    await Tasks.updateAsync(
      { projectId, watchers: userId },
      { $pull: { watchers: userId } },
      { multi: true }
    );

    if (Permissions.isAdmin(userId, projectId)) {
      Permissions.removeAdmin(userId, projectId);
    }
  }
});

Projects.methods.leave = new ValidatedMethod({
  name: "projects.leave",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    const userId = Meteor.userId();

    if (await Projects.find({ _id: projectId, members: userId }).countAsync() === 0) {
      return;
    }
    await Projects.updateAsync({ _id: projectId }, { $pull: { members: userId } });
    await Tasks.updateAsync(
      { projectId, assignedTo: userId },
      { $set: { assignedTo: null } },
      { multi: true }
    );

    await Tasks.updateAsync(
      { projectId, watchers: userId },
      { $pull: { watchers: userId } },
      { multi: true }
    );

    await Meteor.users.updateAsync(
      { _id: userId },
      { $pull: { "profile.favoriteProjects": projectId, "profile.digests": projectId } }
    );

    const query = { _id: userId };
    query[`roles.${projectId}`] = { $exists: true };
    const update = { $unset: {} };
    update.$unset[`roles.${projectId}`] = 1;
    Meteor.users.update(query, update);
  }
});

Projects.methods.setStartDate = new ValidatedMethod({
  name: "projects.setStartDate",
  validate: new SimpleSchema({
    projectId: { type: String },
    startDate: { type: String, optional: true }
  }).validator(),
  async run({ projectId, startDate }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);
    await Projects.updateAsync({ _id: projectId }, { $set: { startDate } });
  }
});

Projects.methods.setEndDate = new ValidatedMethod({
  name: "projects.setEndDate",
  validate: new SimpleSchema({
    projectId: { type: String },
    endDate: { type: String, optional: true }
  }).validator(),
  async run({ projectId, endDate }) {
    checkLoggedIn();
    await checkIfAdminOrCreator(projectId);
    await Projects.updateAsync({ _id: projectId }, { $set: { endDate } });
  }
});

Projects.methods.setDatesAndState = new ValidatedMethod({
  name: "projects.setDatesAndState",
  validate: new SimpleSchema({
    projectId: { type: String },
    startDate: { type: String, optional: true },
    endDate: { type: String, optional: true },
    state: { type: String, optional: true }
  }).validator(),
  async run({ projectId, startDate, endDate, state }) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    await Projects.updateAsync(
      { _id: projectId },
      { $set: { startDate, endDate, state } }
    );
  }
});

Projects.methods.getHistory = new ValidatedMethod({
  name: "projects.getHistory",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number }
  }).validator(),
  async run({ projectId, page }) {
    await checkCanReadProject(projectId);
    const query = {
      "properties.task.projectId": projectId
    };

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = await Events.find(query).countAsync();
    const data = Events.find(query, {
      skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetchAsync();

    const dataWithUsers = [];
    data.forEach(async (item) => {
      item.user = item.userId;
      const user = await Meteor.users.findOneAsync({ _id: item.userId });
      if (user) {
        item.user = UserUtils.getEmail(user);
      }
      dataWithUsers.push(item);
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: dataWithUsers
    };
  }
});

Projects.methods.getDeletedTasks = new ValidatedMethod({
  name: "projects.getDeletedTasks",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number }
  }).validator(),
  async run({ projectId, page }) {
    checkLoggedIn();
    await checkCanReadProject(projectId);

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = { projectId, deleted: true };
    const count = await Tasks.find(query).countAsync();
    const data = await Tasks.find(query, {
      skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetchAsync();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Projects.methods.flushTrashcan = new ValidatedMethod({
  name: "projects.flushTrashcan",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    checkLoggedIn();
    await checkCanWriteProject(projectId);
    const query = { projectId, deleted: true };
    const tasks = Tasks.find(query);
    await tasks.forEachAsync(async (task) => {
      Meteor.callAsync("tasks.deleteForever", task._id);
    });
  }
});

Projects.methods.getDeletedProjects = new ValidatedMethod({
  name: "projects.getDeletedProjects",
  validate: null,
  async run() {
    checkLoggedIn();

    const userId = Meteor.userId();
    const query = {
      deleted: true
    };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    const data = await Projects.find(query, {
      sort: {
        createdAt: -1
      }
    }).fetchAsync();

    return {
      data
    };
  }
});

Projects.methods.addToUserFavorites = new ValidatedMethod({
  name: "projects.addToUserFavorites",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    await Meteor.users.updateAsync(userId, {
      $push: { "profile.favoriteProjects": projectId }
    });
  }
});

Projects.methods.removeFromUserFavorites = new ValidatedMethod({
  name: "projects.removeFromUserFavorites",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    check(projectId, String);
    check(userId, String);
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    await Meteor.users.updateAsync(userId, {
      $pull: { "profile.favoriteProjects": projectId }
    });
  }
});

Projects.methods.addToUserDigests = new ValidatedMethod({
  name: "projects.addToUserDigests",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    await Meteor.users.updateAsync(userId, {
      $push: { "profile.digests": projectId }
    });
  }
});

Projects.methods.removeFromUserDigests = new ValidatedMethod({
  name: "projects.removeFromUserDigests",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  async run({ projectId, userId }) {
    checkLoggedIn();
    check(projectId, String);
    check(userId, String);
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    await Meteor.users.updateAsync(userId, {
      $pull: { "profile.digests": projectId }
    });
  }
});

if (Meteor.isServer) {
  Projects.methods.addFeature = new ValidatedMethod({
    name: "projects.addFeature",
    validate: new SimpleSchema({
      projectId: { type: String },
      feature: { type: String }
    }).validator(),
    async run({ projectId, feature }) {
      checkLoggedIn();
      await checkCanWriteProject(projectId);
      await Projects.updateAsync({ _id: projectId }, { $addToSet: { features: feature } });
      return Projects.findOneAsync({ _id: projectId });
    }
  });

  Projects.methods.removeFeature = new ValidatedMethod({
    name: "projects.removeFeature",
    validate: new SimpleSchema({
      projectId: { type: String },
      feature: { type: String }
    }).validator(),
    async run({ projectId, feature }) {
      checkLoggedIn();
      await checkCanWriteProject(projectId);
      await Projects.updateAsync({ _id: projectId }, { $pull: { features: feature } });
      return Projects.findOneAsync({ _id: projectId });
    }
  });

  Projects.methods.loadFeatures = new ValidatedMethod({
    name: "projects.loadFeatures",
    validate: new SimpleSchema({
      projectId: { type: String }
    }).validator(),
    async run({ projectId }) {
      checkLoggedIn();
      await checkCanReadProject(projectId);
      const project = await Projects.findOneAsync(
        { _id: projectId },
        { fields: { features: 1 } }
      );
      return project.features || [];
    }
  });

  Projects.methods.hasFeature = new ValidatedMethod({
    name: "projects.hasFeature",
    validate: new SimpleSchema({
      projectId: { type: String },
      feature: { type: String }
    }).validator(),
    async run({ projectId, feature }) {
      checkLoggedIn();
      await checkCanReadProject(projectId);
      const project = await Projects.findOneAsync({ _id: projectId });
      const features = project.features || [];
      return features.find((feat) => feat === feature);
    }
  });
}
