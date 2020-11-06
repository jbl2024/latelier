import SimpleSchema from "simpl-schema";
import { Projects, ProjectAccessRights } from "../projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { Canvas } from "/imports/api/canvas/canvas";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Meetings } from "/imports/api/meetings/meetings";
import { UserUtils } from "/imports/api/users/utils";
import { findProjectMembersIds } from "/imports/api/projects/server/common";
import i18n from "/imports/i18n/server/";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

import JSZip from "jszip";
import fs from "fs";
import path from "path";
import os from "os";

import {
  createProjectExportZip,
  projectFilesFromZip,
  findProjectImportZip,
  unserializeProjectImportZip
} from "/imports/api/projects/importExport/";


Projects.methods.create = new ValidatedMethod({
  name: "projects.create",
  validate: new SimpleSchema({
    organizationId: { type: String, optional: true },
    name: { type: String },
    projectType: { type: String },
    projectGroupId: { type: String, optional: true },
    state: { type: String },
    accessRights: { type: String, optional: true },
    features: {
      type: Array,
      optional: true
    },
    "features.$": {
      type: String
    },
    locale: {
      type: String,
      optional: true
    }
  }).validator(),
  run({
    organizationId,
    name,
    projectType,
    projectGroupId,
    state,
    accessRights,
    features,
    locale
  }) {
    checkLoggedIn();
    const currentUserId = Meteor.userId();
    locale = locale || "en";
    const i18nHelper = i18n(locale.split("-")[0]);

    const projectId = Projects.insert({
      organizationId,
      name,
      state,
      createdAt: new Date(),
      createdBy: currentUserId,
      accessRights,
      features
    });
    Meteor.call("projects.addMember", {
      projectId,
      userId: currentUserId
    });
    Meteor.call("permissions.initializeProjectPermissions", {
      projectId
    });

    if (projectType === "kanban") {
      Meteor.call("lists.insert", projectId, i18nHelper.t("Todo"));
      Meteor.call("lists.insert", projectId, i18nHelper.t("Doing"));
      Meteor.call("lists.insert", projectId, i18nHelper.t("Done"), true, true);
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
    if (organizationId && accessRights === ProjectAccessRights.ORGANIZATION) {
      Meteor.call("organizations.propagateMembership", {
        organizationId,
        projectId
      });
    }
    return projectId;
  }
});

Projects.methods.load = new ValidatedMethod({
  name: "projects.load",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    organizationId: { type: String, optional: true },
    page: { type: Number }
  }).validator(),
  run({ name, organizationId, page }) {
    checkLoggedIn();

    const userId = Meteor.userId();
    const query = { deleted: { $ne: true } };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = Projects.find(query).count();
    const data = Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Projects.methods.info = new ValidatedMethod({
  name: "projects.info",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkCanReadProject(projectId);
    const project = Projects.findOne({ _id: projectId });
    const taskCount = Tasks.find({
      projectId: projectId,
      deleted: { $ne: true }
    }).count();

    const completedTaskCount = Tasks.find({
      projectId: projectId,
      completed: true,
      deleted: { $ne: true }
    }).count();

    const userCount = (project.members || []).length;
    const diagramCount = ProcessDiagrams.find({ projectId: projectId }).count();
    const meetingCount = Meetings.find({
      projectId: projectId,
      deleted: { $ne: true }
    }).count();
    const canvas = Canvas.findOne({ projectId: projectId });
    let canvasProgression = 0;
    if (canvas && canvas.data) {
      let itemCount = 0;
      let itemCompleted = 0;
      Object.keys(canvas.data).forEach((item) => {
        itemCount += 1;
        if (canvas.data[item].length > 0) {
          itemCompleted += 1;
        }
      });
      if (itemCount > 0) {
        canvasProgression = Math.trunc(100 * (itemCompleted / itemCount));
      }
    }

    const healthReport = HealthReports.findOne(
      { projectId: projectId },
      {
        sort: {
          date: -1
        }
      }
    );

    return {
      taskCount: taskCount,
      completedTaskCount: completedTaskCount,
      meetingCount: meetingCount,
      userCount: userCount,
      diagramCount: diagramCount,
      canvasProgression: canvasProgression,
      healthReport: healthReport
    };
  }
});

Projects.methods.adminFind = new ValidatedMethod({
  name: "admin.findProjects",
  validate: new SimpleSchema({
    page: { type: Number },
    filter: { type: String, optional: true },
    isDeleted: { type: Boolean, optional: true }
  }).validator(),
  run({ page, filter, isDeleted }) {
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {};
    if (filter && filter.length > 0) {
      query.name = {
        $regex: `.*${filter}.*`,
        $options: "i"
      };
    }
    if (isDeleted) {
      query.deleted = true;
    }
    const count = Projects.find(query).count();

    const data = Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

    const loadUser = (aUserId) => {
      if (!aUserId) return {};
      return Meteor.users.findOne(
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
    };

    data.forEach((project) => {
      project.createdBy = loadUser(project.createdBy);
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

const projectOrOrganizationRequired = function () {
  if (!this.field("projectId").value && !this.field("organizationId").value) {
    return SimpleSchema.ErrorTypes.REQUIRED;
  }
  return true;
};
Projects.methods.findUsers = new ValidatedMethod({
  name: "projects.findUsers",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: true,
      custom: projectOrOrganizationRequired
    },
    organizationId: {
      type: String,
      optional: true,
      custom: projectOrOrganizationRequired
    },
    filter: { type: String, optional: true },
    usersIds: { type: Array, optional: true },
    "usersIds.$": {
      type: String
    }
  }).validator(),
  run({ projectId, organizationId, filter, usersIds }) {
    checkLoggedIn();
    let membersIds = [];
    const projectQuery = {};
    if (projectId) {
      projectQuery._id = projectId;
    }
    if (organizationId) {
      projectQuery.organizationId = organizationId;
    }
    const projects = Projects.find(projectQuery).fetch();
    if (!projects || !Array.isArray(projects) || !projects.length) {
      return [];
    }
    projects.forEach((project) => {
      membersIds = membersIds.concat(findProjectMembersIds(project));
    });
    membersIds = [...new Set(membersIds)];
    if (usersIds && Array.isArray(usersIds) && usersIds.length) {
      membersIds = membersIds.filter((memberId) => usersIds.includes(memberId));
    }

    const query = { _id: { $in: membersIds } };
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: "i" }
        }
      };
      query.$or = [
        { emails },
        {
          "profile.email": { $regex: `.*${filter}.*`, $options: "i" }
        },
        {
          "profile.firstName": { $regex: `.*${filter}.*`, $options: "i" }
        },
        {
          "profile.lastName": { $regex: `.*${filter}.*`, $options: "i" }
        }
      ];
    }

    return Meteor.users
      .find(query, {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1
        }
      })
      .fetch();
  }
});

Projects.methods.adminMigrateFeatures = new ValidatedMethod({
  name: "admin.projectsMigrateFeatures",
  validate: null,
  run() {
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const hasMeetings = (project) => Meetings.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasBPMN = (project) => ProcessDiagrams.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasCanvas = (project) => Canvas.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasWeather = (project) => HealthReports.findOne(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const projects = Projects.find({ deleted: { $ne: true } }, {
      fields: { _id: 1 }
    });
    projects.forEach((project) => {
      if (hasMeetings(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "meetings"
        });
      }
      if (hasBPMN(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "bpmn"
        });
      }
      if (hasCanvas(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "canvas"
        });
      }
      if (hasWeather(project)) {
        Meteor.call("projects.addFeature", {
          projectId: project._id,
          feature: "weather"
        });
      }
    });
  }
});

Projects.methods.export = new ValidatedMethod({
  name: "projects.export",
  validate: new SimpleSchema({
    projectId: { type: String },
    items: {
      type: Array,
      optional: true
    },
    "items.$": {
      type: String
    }
  }).validator(),
  async run({
    projectId,
    items
  }) {
    checkLoggedIn();
    const userId = Meteor.userId();

    // Project
    const project = Projects.findOne({ _id: projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }

    // Tasks (project + associated lists and tasks)
    const projectInfos = await new Promise((resolve, reject) => {
      Meteor.call("tasks.exportProject", { projectId }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Users
    const membersIds = findProjectMembersIds(project);
    const users = {};
    membersIds.forEach((id) => {
      UserUtils.loadUser(id, users);
    });

    // Tasks
    const tasksLists = items.includes("tasks") && 
    Array.isArray(projectInfos?.lists) && 
    projectInfos.lists.length > 0 ? 
    projectInfos.lists : null;

    // BPMN Diagrams
    let bpmnDiagrams = items.includes("bpmn") ? 
    ProcessDiagrams.find({ projectId }).fetch() : null;

    // Meetings
    let meetings = items.includes("meetings") ?
    Meetings.find({
      projectId,
      deleted: { $ne: true }
    }).fetch() : null;

    // Canvas
    let canvases = items.includes("canvas") ?
    Canvas.find({
      projectId
    }).fetch() : null;

    // Weather reports
    let healthReports = items.includes("weather") ?
    HealthReports.find({
      projectId
    }).fetch() : null;
    
    const zip = createProjectExportZip({
      project,
      users,
      tasksLists,
      bpmnDiagrams,
      meetings,
      canvases,
      healthReports
    });
    const zipContent = await zip.generateAsync({type:"base64"});
    return {
      data: zipContent
    };
  }
});

Projects.methods.uploadImport = new ValidatedMethod({
  name: "projects.uploadImport",
  validate: new SimpleSchema({
    fileBuffer: { type: Uint8Array }
  }).validator(),
  async run({
    fileBuffer
  }) {
    const userId = Meteor.userId();
    const buffer = Buffer.from(fileBuffer, 'utf-8');
    const zip = await JSZip.loadAsync(buffer);
    const projects = await Promise.all(projectFilesFromZip(zip).map(async (zipFilePath) => {
      const projectRawJson = await zip.file(zipFilePath).async("string");
      return JSON.parse(projectRawJson);
    }));

    return new Promise((resolve, reject) => {
      fs.mkdtemp(path.join(os.tmpdir(), "projects-imports-"), (err, createdDirectory) => {
        if (err) reject(new Meteor.Error("error", "Error when importing project import", err));
        const directoryAndFilename = `${createdDirectory}/${userId}.zip`;
        fs.writeFile(directoryAndFilename, buffer, (err) => {
          if (err) reject(new Meteor.Error("error", "Error when importing project import", err));
          resolve({
            importPath: createdDirectory,
            projects
          });
        });
      });
    });
  }
});

Projects.methods.import = new ValidatedMethod({
  name: "projects.import",
  validate: new SimpleSchema({
    importPath: { type: String },
    locale: { type: String },
    options: { type: Object, blackbox: true }
  }).validator(),
  async run({
    importPath,
    locale,
    options
  }) {
    const userId = Meteor.userId();
    const fullImportPath = `${importPath}/${userId}.zip`;
    if (!fs.existsSync(fullImportPath)) {
      throw new Meteor.Error("error", "Error when retrieving project import");
    }
    const zip = await findProjectImportZip(fullImportPath);
    const zippedProjects = await unserializeProjectImportZip(zip);
    if (!Array.isArray(zippedProjects) || !zippedProjects.length) {
      throw new Meteor.Error("error", "Error when processing project import");
    }
    const zippedProject = zippedProjects[0];
    const project = await zippedProject.getProject();
    if (!project) {
      throw new Meteor.Error("error", "Error when processing project infos");
    }
    try {

      // Project
      const createdProjectId = await new Promise((resolve, reject) => {
        const projectDatas = {
          organizationId: options?.project?.organizationId ? options.project.organizationId : null,
          name: options?.project?.name ? options.project.name : null,
          projectType: "none",
          state: project.state,
          accessRights: ProjectAccessRights.ORGANIZATION,
          features: project.features,
          locale: locale
        };
        Meteor.call(
          "projects.create",
          projectDatas,
          (err, projectId) => {
            if (err) reject(err);
            resolve(projectId);
          }
        );
      });
  
      if (!createdProjectId) {
        throw new Meteor.Error("error", "Error when creating project");
      }
  
      // Lists and Tasks
      const tasksLists = await zippedProject.getTasksLists();
      tasksLists.forEach(async (taskList) => {
        const createdList = await new Promise((resolve, reject) => {
          Meteor.call(
            "lists.insert",
            createdProjectId,
            taskList.name,
            taskList?.autoComplete ? taskList.autoComplete : null,
            taskList?.catchCompleted ? taskList.catchCompleted : null,
            (error, createdList) => {
              if (error) reject(error);
              resolve(createdList);
            }
          );        
        });

        // Tasks
        if (createdList && Array.isArray(taskList?.tasks)) {
          taskList.tasks.forEach(async (task) => {
            const createdTask = await new Promise((resolve, reject) => {
              Meteor.call(
                "tasks.insert",
                createdList.projectId,
                createdList._id,
                task.name,
                (error, task) => {
                  if (error) reject(error);
                  resolve(task);
                }
              );
            });
          });
        }
      });

      // BPMN Diagrams
      const bpmnDiagrams = await zippedProject.getBpmnDiagrams();
      bpmnDiagrams.forEach(async (diagram) => {
        const createdDiagramId = await new Promise((resolve, reject) => {
          Meteor.call("processDiagrams.create",
            {
              projectId: createdProjectId,
              name: diagram.name,
              description: diagram?.description ? diagram.description : null,
              xml: diagram?.xml ? diagram.xml : null
            },
            (error, processDiagramId) => {
              if (error) reject(error);
              resolve(processDiagramId);
            }
          );
        })
      });

    /*
      "users",
      "canvas",
      "weather"
    */
      
    } catch(error) {
      throw new Meteor.Error(error);
    }
  }
});