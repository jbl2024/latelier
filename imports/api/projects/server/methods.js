import SimpleSchema from "simpl-schema";
import { Projects, ProjectStates, ProjectAccessRights, ProjectExportVersions } from "../projects";
import { Organizations } from "/imports/api/organizations/organizations";
import { Tasks } from "/imports/api/tasks/tasks";
import { Labels } from "/imports/api/labels/labels.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { Canvas } from "/imports/api/canvas/canvas";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Attachments } from "/imports/api/attachments/attachments";
import { Meetings } from "/imports/api/meetings/meetings";
import { UserUtils } from "/imports/api/users/utils";
import { findProjectMembersIds, findUserIdsInvolvedInProject } from "/imports/api/projects/server/common";
import i18n from "/imports/i18n/server/";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";
import moment from "moment";
import JSZip from "jszip";

import { createProjectExportZip,
  unserializeProjectImportZip,
  linkAttachmentsToFiles,
  importExportDefaultItems } from "/imports/api/projects/importExport/";

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
    description: {
      type: String,
      optional: true
    },
    color: {
      type: String,
      optional: true
    },
    startDate: {
      type: String,
      optional: true
    },
    endDate: {
      type: String,
      optional: true
    },
    locale: {
      type: String,
      optional: true
    }
  }).validator(),
  async run({
    organizationId,
    name,
    projectType,
    projectGroupId,
    state,
    accessRights,
    features,
    description,
    color,
    startDate,
    endDate,
    locale
  }) {
    checkLoggedIn();
    const currentUserId = Meteor.userId();
    locale = locale || "en";
    const i18nHelper = i18n(locale.split("-")[0]);

    const projectId = await Meteor.callAsync("projects.insert", {
      organizationId,
      name,
      state,
      createdAt: new Date(),
      createdBy: currentUserId,
      accessRights,
      features,
      description,
      color,
      startDate,
      endDate
    });
    await Meteor.callAsync("projects.addMember", {
      projectId,
      userId: currentUserId
    });
    await Meteor.callAsync("permissions.initializeProjectPermissions", {
      projectId
    });

    try {
      if (projectType === "kanban") {
        await Meteor.callAsync("lists.insert", projectId, i18nHelper.t("Todo"));
        await Meteor.callAsync("lists.insert", projectId, i18nHelper.t("Doing"));
        await Meteor.callAsync("lists.insert", projectId, i18nHelper.t("Done"), true, true);
      }

      if (projectType === "people") {
        await Meteor.callAsync("lists.insert", projectId, "Vincent");
        await Meteor.callAsync("lists.insert", projectId, "François");
        await Meteor.callAsync("lists.insert", projectId, "Paul");
        await Meteor.callAsync("lists.insert", projectId, "... et les autres");
      }

      if (projectGroupId) {
        await Meteor.callAsync("projectGroups.addProject", projectGroupId, projectId);
      }
      if (organizationId && accessRights === ProjectAccessRights.ORGANIZATION) {
        await Meteor.callAsync("organizations.propagateMembership", {
          organizationId,
          projectId
        });
      }
      return projectId;
    } catch (e) {
      this.$notifyError(e.message);
      return null;
    }
  }
});

Projects.methods.load = new ValidatedMethod({
  name: "projects.load",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    organizationId: { type: String, optional: true },
    page: { type: Number }
  }).validator(),
  async run({ name, organizationId, page }) {
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

    try {
      const count = await Meteor.callAsync("projects.count", query);
      const data = await Meteor.callAsync("projects.find", {
        query,
        skip,
        limit: perPage,
        sort: {
          name: 1
        }
      });

      return {
        rowsPerPage: perPage,
        totalItems: count,
        data
      };
    } catch (error) {
      this.$notifyError(error.message);
      return {
        rowsPerPage: perPage,
        totalItems: 0,
        data: []
      };
    }
  }
});

Projects.methods.info = new ValidatedMethod({
  name: "projects.info",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    try {
      checkCanReadProject(projectId);

      const project = await Projects.findOneAsync({ _id: projectId });
      const taskCount = await Tasks.find({
        projectId: projectId,
        deleted: { $ne: true }
      }).countAsync();

      const completedTaskCount = await Tasks.find({
        projectId: projectId,
        completed: true,
        deleted: { $ne: true }
      }).countAsync();

      const userCount = (project.members || []).length;
      const diagramCount = await ProcessDiagrams.find({ projectId: projectId }).countAsync();
      const meetingCount = await Meetings.find({
        projectId: projectId,
        deleted: { $ne: true }
      }).countAsync();
      const canvas = await Canvas.findOneAsync({ projectId: projectId });
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

      const healthReport = await HealthReports.findOneAsync(
        { projectId: projectId },
        {
          sort: {
            date: -1
          }
        }
      );

      const attachmentCount = await Attachments.find({ "meta.projectId": projectId }).count();

      return {
        taskCount,
        completedTaskCount,
        meetingCount,
        userCount,
        diagramCount,
        canvasProgression,
        healthReport,
        attachmentCount
      };
    } catch (error) {
      this.$notifyError(error.message);
      return {};
    }
  }
});

Projects.methods.adminFind = new ValidatedMethod({
  name: "admin.findProjects",
  validate: new SimpleSchema({
    page: { type: Number },
    filter: { type: String, optional: true },
    projectStates: { type: Array, optional: true },
    "projectStates.$": { type: String },
    isDeleted: { type: Boolean, optional: true }
  }).validator(),
  async run({ page, filter, projectStates, isDeleted }) {
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

    if (Array.isArray(projectStates) && projectStates.length) {
      query.state = { $in: projectStates };
    }

    if (isDeleted) {
      query.deleted = true;
    }
    const count = await Projects.find(query).countAsync();

    const data = await Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetchAsync();

    const loadUser = async (aUserId) => {
      if (!aUserId) return {};
      return Meteor.users.findOneAsync(
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

    data.forEach(async (project) => {
      project.createdBy = await loadUser(project.createdBy);
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

Projects.methods.findUsers = new ValidatedMethod({
  name: "projects.findUsers",
  validate: new SimpleSchema({
    projectId: {
      type: String
    }
  }).validator(),
  async run({ projectId }) {
    await checkLoggedIn();
    await checkCanReadProject(projectId);

    const project = Projects.findOne({ _id: projectId });
    let organization;
    if (!project) {
      throw new Meteor.Error("not-found");
    }
    if (project.organizationId
      && project.accessRights === ProjectAccessRights.ORGANIZATION) {
      organization = Organizations.findOne({ _id: project.organizationId });
    }
    const membersIds = findProjectMembersIds(project);
    const users = Meteor.users
      .find({ _id: { $in: membersIds } }, {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1,
          roles: 1
        }
      })
      .fetch();
    const organizationMembers = organization?.members || [];

    users.forEachAsync(async (user) => {
      if (user._id === project.createdBy) {
        user.isOwner = true;
      }
      if (organizationMembers.indexOf(user._id) !== -1) {
        user.inOrganization = true;
      }
    });

    return users.sort((a, b) => {
      const emailA = (UserUtils.getEmail(a) || "").toLowerCase();
      const emailB = (UserUtils.getEmail(b) || "").toLowerCase();
      return emailA.localeCompare(emailB);
    });
  }
});

Projects.methods.adminMigrateFeatures = new ValidatedMethod({
  name: "admin.projectsMigrateFeatures",
  validate: null,
  async run() {
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const hasMeetings = async (project) => Meetings.findOneAsync(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasBPMN = async (project) => ProcessDiagrams.findOneAsync(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasCanvas = async (project) => Canvas.findOneAsync(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const hasWeather = async (project) => HealthReports.findOneAsync(
      { projectId: project._id },
      {
        fields: { _id: 1 }
      }
    );

    const projects = Projects.find({ deleted: { $ne: true } }, {
      fields: { _id: 1 }
    });
    projects.forEachAsync(async (project) => {
      if (await hasMeetings(project)) {
        await Meteor.callAsync("projects.addFeature", {
          projectId: project._id,
          feature: "meetings"
        });
      }
      if (await hasBPMN(project)) {
        await Meteor.callAsync("projects.addFeature", {
          projectId: project._id,
          feature: "bpmn"
        });
      }
      if (await hasCanvas(project)) {
        await Meteor.callAsync("projects.addFeature", {
          projectId: project._id,
          feature: "canvas"
        });
      }
      if (await hasWeather(project)) {
        await Meteor.callAsync("projects.addFeature", {
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
    if (!Permissions.isAdmin(Meteor.userId(), projectId)) {
      throw new Meteor.Error("not-authorized");
    }

    items = items || [];

    // Project
    const project = await Projects.findOneAsync({ _id: projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }

    // Tasks (project + associated lists and tasks)
    const projectInfos = await Meteor.callAsync("tasks.exportProject", { projectId });

    // Users
    const membersIds = findUserIdsInvolvedInProject(project);
    const users = {};
    membersIds.forEach(async (id) => {
      await UserUtils.loadUser(id, users, {
        profile: 1,
        emails: 1
      });
    });

    // Tasks
    const tasksLists = items.includes("tasks")
    && Array.isArray(projectInfos?.lists)
    && projectInfos.lists.length > 0
      ? projectInfos.lists : null;

    // Labels
    const labels = items.includes("tasks")
      ? Labels.find({ projectId: projectId }).fetch() : null;

    // BPMN Diagrams
    const bpmnDiagrams = items.includes("bpmn")
      ? ProcessDiagrams.find({ projectId }).fetch() : null;

    // Meetings
    const meetings = items.includes("meetings")
      ? Meetings.find({
        projectId,
        deleted: { $ne: true }
      }).fetch() : null;

    // Canvas
    const canvas = items.includes("canvas")
      ? Canvas.findOne({
        projectId
      }) : null;

    // Weather reports
    const healthReports = items.includes("weather")
      ? HealthReports.find({
        projectId
      }).fetch() : null;

    // Attachments
    const attachments = items.includes("attachments")
      ? Attachments.find({ "meta.projectId": projectId }).fetch() : null;

    // Export metadata
    currentUser = Meteor.user();
    const metadatas = {
      version: ProjectExportVersions.V2020_11,
      createdAt: new Date(),
      createdBy: {
        _id: currentUser._id,
        emails: currentUser?.emails || [],
        profile: currentUser?.profile || null
      }
    };

    const zip = await createProjectExportZip({
      metadatas,
      project,
      users,
      tasksLists,
      labels,
      bpmnDiagrams,
      meetings,
      canvas,
      healthReports,
      attachments
    });
    const zipContent = await zip.generateAsync({ type: "uint8array" });
    return {
      data: zipContent
    };
  }
});

Projects.methods.import = new ValidatedMethod({
  name: "projects.import",
  validate: new SimpleSchema({
    locale: { type: String },
    fileBuffer: { type: Uint8Array },
    accessRights: { type: String, optional: true },
    projectName: {
      type: String
    },
    organizationId: {
      type: String,
      optional: true
    },
    items: {
      type: Array,
      optional: true
    },
    "items.$": {
      type: String
    }
  }).validator(),
  async run({
    locale,
    fileBuffer,
    accessRights,
    projectName,
    items,
    organizationId
  }) {
    let createdProjectId;
    try {
      const currentUserId = Meteor.userId();
      if (!Permissions.isAdmin(currentUserId, organizationId)) {
        throw new Meteor.Error("not-authorized");
      }

      items = Array.isArray(items) ? items : importExportDefaultItems;

      const zip = await JSZip.loadAsync(fileBuffer);
      const zippedProjects = await unserializeProjectImportZip(zip);
      if (!Array.isArray(zippedProjects) || !zippedProjects.length) {
        throw new Meteor.Error("project-import", "Error when processing project import");
      }
      const zippedProject = zippedProjects[0];
      const project = await zippedProject.getContent("project");

      if (!project) {
        throw new Meteor.Error("project-import", "Error when processing project infos");
      }

      // Project
      createdProjectId = await Meteor.callAsync(
        "projects.create",
        {
          organizationId: organizationId || null,
          name: projectName,
          projectType: "none",
          state: ProjectStates.IMPORTING,
          accessRights,
          features: project.features,
          locale: locale,
          color: project.color ? project.color : null,
          description: project.description ? project.description : null,
          startDate: project.startDate ? project.startDate : null,
          endDate: project.endDate ? project.endDate : null
        }
      );

      if (!createdProjectId) {
        throw new Meteor.Error("project-import", "Error when creating project");
      }

      const dateFormat = "YYYY-MM-DD HH:mm";

      const canImportUsers = items.includes("users")
        && !Meteor.settings.disableAccountCreation
        && Permissions.isAdmin(currentUserId);

      const canImportAttachments = !Meteor.settings?.public?.disableAttachments
      && items.includes("attachments");

      const canImportMeetings = items.includes("meetings");

      const canImportTasks = items.includes("tasks");

      // Mapping imported ids with inserted ids
      const mappedIds = {
        users: {},
        tasks: {},
        labels: {},
        attachments: {}
      };

      // Try to find the corresponding imported entity with its inserted id
      // For users, if we don't find users we replace it by default with currentUserId
      const getMapId = (id, item, replaceWithCurrentUserId = true) => {
        if (replaceWithCurrentUserId === true && item === "users" && !canImportUsers) return currentUserId;
        if (!mappedIds[item]) return null;
        return mappedIds[item][id] ? mappedIds[item][id] : null;
      };

      // Attachments related tasks
      let attachmentsMetadatas = [];
      let attachmentsTasksIds = [];
      if (canImportAttachments) {
        attachmentsMetadatas = await zippedProject.getContent("attachments/metadatas");
        if (Array.isArray(attachmentsMetadatas) && attachmentsMetadatas.length) {
          attachmentsTasksIds = attachmentsMetadatas
            .filter((a) => a.meta?.taskId)
            .map((a) => a.meta.taskId);
        }
      }

      // Meetings related tasks
      const meetingsTasksIds = [];
      let meetings = [];
      if (canImportMeetings) {
        meetings = await zippedProject.getContent("meetings");
        meetings.filter((m) => Array.isArray(m?.actions) && m.actions.length).forEach((meeting) => {
          meeting.actions.filter((a) => a.taskId).forEach((a) => {
            meetingsTasksIds.push(a.taskId);
          });
        });
      }

      if (canImportUsers) {
        const users = await zippedProject.getContent("users");
        const usersIds = Object.keys(users);
        if (users && usersIds.length) {
          usersIds.forEach(async (userId) => {
            if (!mappedIds.users[userId]) {
              const user = users[userId];
              const userEmail = UserUtils.getEmail(user);
              const existingUser = Meteor.users.findOne({
                emails: {
                  $elemMatch: {
                    address: { $regex: userEmail, $options: "i" }
                  }
                }
              });
              const createdUserId = existingUser && existingUser?._id
                ? existingUser._id : Accounts.createUser({
                  createdAt: new Date(),
                  email: userEmail,
                  profile: user.profile
                });

              if (!createdUserId) {
                throw new Meteor.Error("project-import", "Error when importing user");
              }

              mappedIds.users[user._id] = createdUserId;
              await Meteor.callAsync("projects.addMember", {
                projectId: createdProjectId,
                userId: createdUserId
              });
            }
          });
        }
      }

      // Tasks and associations (Lists, Labels ...)
      if (canImportTasks) {
        const labels = await zippedProject.getContent("labels");
        if (Array.isArray(labels) && labels.length) {
          labels.forEach((label) => {
            const labelId = Labels.insert({
              projectId: createdProjectId,
              name: label.name,
              color: label.color,
              createdAt: new Date(label.createdAt),
              createdBy: getMapId(label.createdBy, "users")
            });
            mappedIds.labels[label._id] = labelId;
          });
        }

        const tasksLists = await zippedProject.getContent("tasks");
        if (Array.isArray(tasksLists) && tasksLists.length) {
          // Preserve tasksLists order
          tasksLists.sort((a, b) => {
            if (a.order < b.order) return -1;
            if (a.order > b.order) return 1;
            return 0;
          });

          tasksLists.forEach(async (taskList) => {
            const createdList = await Meteor.callAsync(
              "lists.insert",
              createdProjectId,
              taskList.name,
              taskList?.autoComplete ? taskList.autoComplete : null,
              taskList?.catchCompleted ? taskList.catchCompleted : null,
              getMapId(taskList.createdBy, "users")
            );

            // Tasks
            if (createdList && Array.isArray(taskList?.tasks)) {
              // Preserve tasks order (Tasks are inserted as first on top of list)
              taskList.tasks.sort((a, b) => {
                if (a.order < b.order) return 1;
                if (a.order > b.order) return -1;
                return 0;
              });

              taskList.tasks.forEach(async (task) => {
                // Notes
                let notes = null;
                if (Array.isArray(task.notes)) {
                  notes = task.notes.map((note) => {
                    note.createdBy = getMapId(note.createdBy, "users");
                    if (note.editedBy) {
                      note.editedBy = getMapId(note.editedBy, "users");
                    }
                    return note;
                  });
                }

                // Checklist
                let checklist = null;
                if (Array.isArray(task.checklist)) {
                  checklist = task.checklist.map((listItem) => {
                    listItem.createdBy = getMapId(listItem.createdBy, "users");
                    return listItem;
                  });
                }

                // Labels
                let taskLabelsIds = null;
                if (Array.isArray(task.labels)) {
                  taskLabelsIds = task.labels.map((labelId) => mappedIds.labels[labelId]
                    ? mappedIds.labels[labelId] : null).filter((l) => l);
                }

                // Task watchers
                const watchers = [];
                if (Array.isArray(task.watchers) && task.watchers.length > 0) {
                  task.watchers.forEach((watcherId) => {
                    const watcherMappedId = getMapId(watcherId, "users", false);
                    if (watcherMappedId !== null && !watchers.includes(watcherMappedId)) {
                      watchers.push(watcherMappedId);
                    }
                  });
                }

                const disableTracking = true;

                let { estimation } = task;
                if (estimation) {
                  if (!estimation.size || !estimation.spent) {
                    estimation = null;
                  }
                }

                let reminderDueDate = { task };
                if (!Number.isFinite(reminderDueDate)) {
                  reminderDueDate = null;
                }

                const createdTask = await Meteor.callAsync(
                  "tasks.insert",
                  createdList.projectId,
                  createdList._id,
                  task.name,
                  Array.isArray(taskLabelsIds) && taskLabelsIds.length ? taskLabelsIds : null,
                  getMapId(task.assignedTo, "users", false),
                  task.dueDate ? moment(task.dueDate).format(dateFormat) : null,
                  task.startDate ? moment(task.startDate).format(dateFormat) : null,
                  task.description ? task.description : null,
                  Array.isArray(watchers) && watchers.length ? watchers : null,
                  notes,
                  checklist,
                  task.reminderStartDate ? task.reminderStartDate : null,
                  reminderDueDate,
                  estimation,
                  getMapId(task.createdBy, "users"),
                  disableTracking
                );

                if (canImportAttachments && attachmentsTasksIds.includes(task._id)) {
                  mappedIds.tasks[task._id] = createdTask._id;
                }

                if (canImportMeetings && meetingsTasksIds.includes(task._id)) {
                  mappedIds.tasks[task._id] = createdTask._id;
                }
              });
            }
          });
        }
      }

      // BPMN Diagrams
      if (items.includes("bpmn")) {
        const bpmnDiagrams = await zippedProject.getContent("bpmn");
        if (Array.isArray(bpmnDiagrams) && bpmnDiagrams.length) {
          bpmnDiagrams.forEach(async (diagram) => {
            await Meteor.callAsync("processDiagrams.create",
              {
                projectId: createdProjectId,
                name: diagram.name,
                description: diagram?.description ? diagram.description : null,
                xml: diagram?.xml ? diagram.xml : null,
                diagramUserId: getMapId(diagram.createdBy, "users")
              });
          });
        }
      }

      // Canvas
      if (items.includes("canvas")) {
        const canvas = await zippedProject.getContent("canvas");
        if (canvas && canvas._id && canvas.data) {
          await Canvas.insertAsync({
            projectId: createdProjectId,
            createdAt: new Date(),
            createdBy: getMapId(canvas.createdBy, "users"),
            data: canvas.data
          });
        }
      }

      // Weather (Health reports)
      if (items.includes("weather")) {
        const healthReports = await zippedProject.getContent("weather");
        if (Array.isArray(healthReports) && healthReports.length) {
          healthReports.forEach(async (healthReport) => {
            await Meteor.callAsync("healthReports.create",
              {
                projectId: createdProjectId,
                name: healthReport.name,
                description: healthReport?.description ? healthReport.description : null,
                date: healthReport.date,
                weather: healthReport.weather,
                reportUserId: getMapId(healthReport.createdBy, "users")
              });
          });
        }
      }

      // Attachments
      if (canImportAttachments) {
        const attachmentsFiles = await zippedProject.getFiles("attachments");
        if (Array.isArray(attachmentsFiles) && attachmentsFiles.length) {
          linkAttachmentsToFiles(attachmentsFiles, attachmentsMetadatas);
          const mapAttachmentMeta = (meta) => {
            const mappedMeta = { ...meta, projectId: createdProjectId };
            if (mappedMeta.createdAt) {
              mappedMeta.createdAt = new Date(meta.createdAt);
            }
            if (mappedMeta.createdBy) {
              mappedMeta.createdBy = getMapId(mappedMeta.createdBy, "users");
            }
            if (mappedMeta.taskId) {
              mappedMeta.taskId = canImportTasks ? getMapId(mappedMeta.taskId, "tasks") : null;
            }
            return mappedMeta;
          };

          const importAttachmentFile = async(file) => {
            if (!file.attachment) {
              throw new Meteor.Error("project-import", "Error when processing attachment metadatas");
            }
            const data = await file.async("uint8array");
            return new Promise((resolve, reject) => {
              Attachments.write(data, {
                fileName: file.attachment.name,
                type: file.attachment.type,
                userId: currentUserId,
                meta: mapAttachmentMeta(file.attachment.meta)
              }, function (writeError, fileRef) {
                if (writeError) reject(writeError);
                mappedIds.attachments[file.attachment._id] = fileRef._id;
                resolve(fileRef);
              });
            });
          };

          const processAttachments = async (files) => files.reduce(async (p, file) => {
            await p;
            return importAttachmentFile(file);
          }, Promise.resolve());

          await processAttachments(attachmentsFiles);
        }
      }

      // Meetings
      if (canImportMeetings) {
        if (Array.isArray(meetings) && meetings.length) {
          meetings.forEach(async (meeting) => {
            let attendees = Array.isArray(meeting?.attendees) ? meeting?.attendees : null;
            if (attendees.length > 0) {
              attendees = attendees.map((attendee) => {
                if (attendee.userId) {
                  attendee.userId = getMapId(attendee.userId, "users", false);
                }
                return attendee;
              });
            }

            let documents = null;
            if (canImportAttachments && Array.isArray(meeting?.documents)
            && meeting?.documents.length > 0) {
              documents = meeting.documents.map((doc) => {
                doc.documentId = getMapId(doc.documentId, "attachments");
                return doc;
              });
            }

            let actions = Array.isArray(meeting?.actions) ? meeting?.actions : null;
            if (actions.length > 0) {
              actions = actions.map((action) => {
                if (action.taskId) {
                  action.taskId = canImportTasks ? getMapId(action.taskId, "tasks") : null;
                }
                return action;
              });
            }
            await Meteor.callAsync("meetings.create",
              {
                projectId: createdProjectId,
                name: meeting.name,
                state: meeting?.state ? meeting.state : null,
                type: meeting?.type ? meeting.type : null,
                description: meeting?.description ? meeting.description : null,
                agenda: meeting?.agenda ? meeting.agenda : null,
                color: meeting?.color ? meeting.color : null,
                location: meeting?.location ? meeting.location : null,
                startDate: meeting.startDate,
                endDate: meeting.endDate,
                attendees,
                documents,
                actions,
                report: meeting?.report ? meeting.report : null,
                meetingUserId: getMapId(meeting.createdBy, "users")
              });
          });
        }
      }

      // Updating with corresponding state
      await Meteor.callAsync("projects.updateState", {
        projectId: createdProjectId,
        state: project.state
      });

      return createdProjectId;
    } catch (error) {
      /* eslint no-console:off */
      console.log("Error import", error);
      // Error state
      if (createdProjectId) {
        await Meteor.callAsync("projects.updateState", {
          projectId: createdProjectId,
          state: ProjectStates.ERROR
        });
      }
      throw error;
    }
  }
});
