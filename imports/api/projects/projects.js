import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams.js";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import { Labels } from "/imports/api/labels/labels.js";
import { Events } from "/imports/api/events/events.js";
import { Permissions, checkLoggedIn, checkCanReadProject, checkCanWriteProject } from "/imports/api/permissions/permissions"

export const Projects = new Mongo.Collection("projects");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Projects.rawCollection().createIndex({ organizationId: 1 });
    Projects.rawCollection().createIndex({ deleted: 1 });
  });
}

export const ProjectStates = Object.freeze({
  PLANNED: "planned",
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  ARCHIVED: "archived"
});

Projects.methods = {};

const checkIfAdminOrCreator = (projectId) => {
  if (Permissions.isAdmin(Meteor.userId())) {
    return true;
  }
  if (Permissions.isAdmin(Meteor.userId(), projectId)) {
    return true;
  }
  const project = Projects.findOne(projectId);
  if (project.createdBy != Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
}

Projects.methods.insert = new ValidatedMethod({
  name: "projects.insert",
  validate: new SimpleSchema({
    organizationId: { type: String },
    name: { type: String }
  }).validator(),
  run({ organizationId, name }) {
    checkLoggedIn();
   
    var project = Projects.insert({
      organizationId: organizationId,
      name: name,
      state: ProjectStates.DEVELOPMENT,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return project;
  }
});

Projects.methods.create = new ValidatedMethod({
  name: "projects.create",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    name: { type: String },
    projectType: { type: String },
    projectGroupId: { type: String, optional: true },
    state: { type: String }
  }).validator(),
  run({ organizationId, name, projectType, projectGroupId, state }) {
    checkLoggedIn();
    const currentUserId = Meteor.userId();

    const projectId = Projects.insert({
      organizationId: organizationId,
      name,
      state,
      createdAt: new Date(),
      createdBy: currentUserId
    });
    Meteor.call("projects.addMember", {projectId: projectId, userId: currentUserId});
    Meteor.call("permissions.initializeProjectPermissions", {projectId: projectId});

    if (projectType === "kanban") {
      Meteor.call("lists.insert", projectId, "A planifier");
      Meteor.call("lists.insert", projectId, "En cours");
      Meteor.call("lists.insert", projectId, "Terminé", true, true);
    }

    if (projectType === "people") {
      Meteor.call("lists.insert", projectId, "Vincent");
      Meteor.call("lists.insert", projectId, "François");
      Meteor.call("lists.insert", projectId, "Paul");
      Meteor.call("lists.insert", projectId, "... et les autres");
    }

    if (projectGroupId) {
      Meteor.call("projectGroups.addProject", projectGroupId, projectId);
    }
    return projectId;
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

    Projects.update({_id: projectId}, {$set: {
      deleted: true,
      deletedBy: Meteor.userId(),
      deletedAt: new Date()
    }});
    
    Meteor.users.update(
      {},
      { $pull: { "profile.favoriteProjects": projectId } },
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

    Tasks.remove({ projectId: projectId });
    Lists.remove({ projectId: projectId });
    Labels.remove({ projectId: projectId });
    ProcessDiagrams.remove({ projectId: projectId });
    HealthReports.remove({ projectId: projectId });
    Canvas.remove({ projectId: projectId });
    Attachments.remove({ "meta.projectId": projectId });
    Meteor.users.update(
      {},
      { $pull: { "profile.favoriteProjects": projectId } },
      { multi: true }
    );
    const projectGroups = ProjectGroups.find({ projects: projectId });
    projectGroups.map(projectGroup => {
      Meteor.call("projectGroups.removeProjet", projectGroup._id, projectId);
    });

    const query = {};
    query[`roles.${projectId}`] = {$exists: true};
    const update = {$unset: {}};
    update.$unset['roles.'+projectId] = 1;
    Meteor.users.update(query, update, {multi: true});
    Projects.remove(projectId);
  }
});

Projects.methods.restore = new ValidatedMethod({
  name: "projects.restore",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    Projects.update({_id: projectId}, {$set: {
      deleted: false,
    }});
    
  }
});

Projects.methods.updateName = new ValidatedMethod({
  name: "projects.updateName",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String }
  }).validator(),
  run({projectId, name}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);

    if (name.length == 0) {
      throw new Meteor.Error("invalid-name");
    }
    Projects.update({ _id: projectId }, { $set: { name: name } });
  }
});

Projects.methods.updateDescription = new ValidatedMethod({
  name: "projects.updateDescription",
  validate: new SimpleSchema({
    projectId: { type: String },
    description: { type: String }
  }).validator(),
  run({projectId, description}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    if (description.length == 0) {
      throw new Meteor.Error("invalid-description");
    }

    Projects.update({ _id: projectId }, { $set: { description: description } });
  }
});

Projects.methods.updateStates = new ValidatedMethod({
  name: "projects.updateState",
  validate: new SimpleSchema({
    projectId: { type: String },
    state: { type: String }
  }).validator(),
  run({projectId, state}) {
    if (state.length == 0) {
      throw new Meteor.Error("invalid-state");
    }

    Projects.update({ _id: projectId }, { $set: { state: state } });
  }
});

Projects.methods.updateColor = new ValidatedMethod({
  name: "projects.updateColor",
  validate: new SimpleSchema({
    projectId: { type: String },
    color: { type: String }
  }).validator(),
  run({projectId, color}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    Projects.update({ _id: projectId }, { $set: { color: color } });
  }
});

Projects.methods.updateIsPublic = new ValidatedMethod({
  name: "projects.updateIsPublic",
  validate: new SimpleSchema({
    projectId: { type: String },
    isPublic: { type: Boolean }
  }).validator(),
  run({projectId, isPublic}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    Projects.update({ _id: projectId }, { $set: { isPublic: isPublic } });
  }
});

Projects.methods.clone = new ValidatedMethod({
  name: "projects.clone",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({projectId}) {
    checkLoggedIn();
    var project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("invalid-project");
    }

    var newProjectId = Projects.insert({
      name: "Copie de " + project.name,
      organizationId: project.organizationId,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      state: project.state,
      startDate: project.startDate,
      members: project.members,
      endDate: project.endDate,
      estimatedSize: project.estimatedSize,
      color: project.color,
      features: project.features
    });

    var newProject = Projects.findOne(newProjectId);
    if (!newProject) {
      throw new Meteor.Error("invalid-new-project");
    }

    var projectGroups = ProjectGroups.find({ projects: projectId });
    projectGroups.map(projectGroup => {
      Meteor.call("projectGroups.addProject", projectGroup._id, newProjectId);
    });

    var labels = Labels.find({ projectId: projectId });
    labels.map(label => {
      Meteor.call("labels.create", {projectId: newProjectId, name: label.name, color: label.color});
    });

    var lists = Lists.find({ projectId: projectId });
    lists.map(list => {
      var newListId = Lists.insert({
        name: list.name,
        order: list.order,
        projectId: newProjectId,
        createdAt: new Date(),
        createdBy: Meteor.userId()
      });

      var tasks = Tasks.find({ listId: list._id });
      tasks.map(task => {
        Meteor.call("tasks.clone", task._id, task.name, newProjectId, newListId, true /* keepDates */);
      });
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
  run({projectId, userId}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);

    if (Projects.find({ _id: projectId, members: userId }).count() > 0) {
      return;
    }
    const project = Projects.findOne({_id: projectId});
    if (!project) {
      throw new Meteor.Error("not-found");
    }
    Projects.update({ _id: projectId }, { $push: { members: userId } });
  }
});

Projects.methods.removeMember = new ValidatedMethod({
  name: "projects.removeMember",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  run({projectId, userId}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);

    if (Projects.find({ _id: projectId, members: userId }).count() == 0) {
      return;
    }
    Projects.update({ _id: projectId }, { $pull: { members: userId } });
    Tasks.update(
      { projectId: projectId, assignedTo: userId },
      { $set: { assignedTo: null } },
      { multi: true }
    );
  }
});

Projects.methods.setStartDate = new ValidatedMethod({
  name: "projects.setStartDate",
  validate: new SimpleSchema({
    projectId: { type: String },
    startDate: { type: String}
  }).validator(),
  run({projectId, startDate}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    Projects.update({ _id: projectId }, { $set: { startDate: startDate } });
  }
});

Projects.methods.setEndDate = new ValidatedMethod({
  name: "projects.setEndDate",
  validate: new SimpleSchema({
    projectId: { type: String },
    endDate: { type: String }
  }).validator(),
  run({projectId, endDate}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    Projects.update({ _id: projectId }, { $set: { endDate: endDate } });
  }
});

Projects.methods.updateEstimatedSize = new ValidatedMethod({
  name: "projects.updateEstimatedSize",
  validate: new SimpleSchema({
    projectId: { type: String },
    estimatedSize: { type: Number }
  }).validator(),
  run({projectId, estimatedSize}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    Projects.update(
      { _id: projectId },
      { $set: { estimatedSize: estimatedSize } }
    );
  }
});

Projects.methods.getHistory = new ValidatedMethod({
  name: "projects.getHistory",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: { type: Number },
  }).validator(),
  run({projectId, page}) {
    checkLoggedIn();
    checkIfAdminOrCreator(projectId);
    const query = {
      "properties.task.projectId": projectId
    };

    const perPage = 4;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = Events.find(query).count();
    const data = Events.find(query, {
      skip: skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetch();

    const dataWithUsers = [];
    data.map(item => {
      item.user = item.userId;
      const user = Meteor.users.findOne({ _id: item.userId });
      if (user) {
        item.user = user.emails[0].address;
      }
      dataWithUsers.push(item);
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: dataWithUsers,
    };
  }
});

Projects.methods.getDeletedTasks = new ValidatedMethod({
  name: "projects.getDeletedTasks",
  validate: new SimpleSchema({
    projectId: { type: String },
    page: {type: Number}
  }).validator(),
  run({projectId, page}) {
    checkLoggedIn();
    checkCanReadProject(projectId);

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {projectId: projectId, deleted: true};
    const count = Tasks.find(query).count();
    const data = Tasks.find(query, {
      skip: skip,
      limit: perPage,
      sort: {
        createdAt: -1
      }
    }).fetch();
    
    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  }
});

Projects.methods.flushTrashcan = new ValidatedMethod({
  name: "projects.flushTrashcan",
  validate: new SimpleSchema({
    projectId: { type: String },
  }).validator(),
  run({projectId}) {
    checkLoggedIn();
    checkCanWriteProject(projectId);
    const query = {projectId: projectId, deleted: true};
    const tasks = Tasks.find(query);
    tasks.map(task => {
      Meteor.call("tasks.deleteForever", task._id);
    });
  }
});

Projects.methods.getDeletedProjects = new ValidatedMethod({
  name: "projects.getDeletedProjects",
  validate: null,
  run() {
    checkLoggedIn();

    const userId = Meteor.userId()
    let query = {
      deleted: true
    }
  
    if (!Permissions.isAdmin(userId)) {
      query['$or'] = [{createdBy: userId}, {members: userId}];
    }
  
    const data = Projects.find(query, {
      sort: {
        createdAt: -1
      }
    }).fetch();
    
    return {
      data: data
    };
  }
});

Projects.methods.addToUserFavorites = new ValidatedMethod({
  name: "projects.addToUserFavorites",
  validate: new SimpleSchema({
    projectId: { type: String },
    userId: { type: String }
  }).validator(),
  run({projectId, userId}) {
    checkLoggedIn();
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    Meteor.users.update(userId, {
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
  run({projectId, userId}) {
    checkLoggedIn();
    check(projectId, String);
    check(userId, String);
    if (!Meteor.userId() || Meteor.userId() !== userId) {
      throw new Meteor.Error("not-authorized");
    }
    Meteor.users.update(userId, {
      $pull: { "profile.favoriteProjects": projectId }
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
    run({projectId, feature}) {
      checkLoggedIn();
      checkCanWriteProject(projectId);
      Projects.update({_id: projectId}, { $addToSet: { features: feature } })
    }
  });

  Projects.methods.removeFeature = new ValidatedMethod({
    name: "projects.removeFeature",
    validate: new SimpleSchema({
      projectId: { type: String },
      feature: { type: String }
    }).validator(),
    run({projectId, feature}) {
      checkLoggedIn();
      checkCanWriteProject(projectId);
      Projects.update({ _id: projectId }, { $pull: { features: feature } });
    }
  });

  Projects.methods.loadFeatures = new ValidatedMethod({
    name: "projects.loadFeatures",
    validate: new SimpleSchema({
      projectId: { type: String },
    }).validator(),
    run({projectId}) {
      checkLoggedIn();
      checkCanReadProject(projectId);
      const project = Projects.findOne({_id: projectId});
      return project.features || [];
    }
  });
  
  Projects.methods.hasFeature = new ValidatedMethod({
    name: "projects.hasFeature",
    validate: new SimpleSchema({
      projectId: { type: String },
      feature: { type: String },
    }).validator(),
    run({projectId, feature}) {
      checkLoggedIn();
      checkCanReadProject(projectId);
      const project = Projects.findOne({_id: projectId});
      const features = project.features || [];
      return features.find(feat => { return feat === feature});
    }
  });
}
