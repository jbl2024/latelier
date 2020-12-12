import SimpleSchema from "simpl-schema";
import { Projects, ProjectStates, ProjectAccessRights, ProjectExportVersions } from "../projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { Labels } from "/imports/api/labels/labels.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { Canvas } from "/imports/api/canvas/canvas";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Attachments } from "/imports/api/attachments/attachments";
import { Meetings } from "/imports/api/meetings/meetings";
import { UserUtils } from "/imports/api/users/utils";
import { findProjectMembersIds } from "/imports/api/projects/server/common";
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
  items as defaultImportItems } from "/imports/api/projects/importExport/";


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
  run({
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

    const projectId = Projects.insert({
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

    const attachmentCount = Attachments.find({ "meta.projectId": projectId }).count();

    return {
      taskCount: taskCount,
      completedTaskCount: completedTaskCount,
      meetingCount: meetingCount,
      userCount: userCount,
      diagramCount: diagramCount,
      canvasProgression: canvasProgression,
      healthReport: healthReport,
      attachmentCount: attachmentCount
    };
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
  run({ page, filter, projectStates, isDeleted }) {
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
    if (!Permissions.isAdmin(Meteor.userId(), projectId)) {
      throw new Meteor.Error("not-authorized");
    }

    items = items || [];

    // Project
    const project = Projects.findOne({ _id: projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }

    // Tasks (project + associated lists and tasks)
    const projectInfos = Meteor.call("tasks.exportProject", { projectId });

    // Users
    const membersIds = findProjectMembersIds(project);
    const users = {};
    membersIds.forEach((id) => {
      UserUtils.loadUser(id, users, {
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

      items = Array.isArray(items) ? items : defaultImportItems;

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
      createdProjectId = Meteor.call(
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

      const getMapId = (id, item) => {
        if (item === "users" && !canImportUsers) return currentUserId;
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
          usersIds.forEach((userId) => {
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
              Meteor.call("projects.addMember", {
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

          tasksLists.forEach((taskList) => {
            const createdList = Meteor.call(
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


              taskList.tasks.forEach((task) => {
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

                // Watchers
                let watchers = null;
                if (Array.isArray(task.watchers) && task.watchers.length > 0) {
                  watchers = task.watchers.map((watcherId) => getMapId(watcherId, "users"));
                }

                const createdTask = Meteor.call(
                  "tasks.insert",
                  createdList.projectId,
                  createdList._id,
                  task.name,
                  Array.isArray(taskLabelsIds) && taskLabelsIds.length ? taskLabelsIds : null,
                  getMapId(task.assignedTo, "users"),
                  task.dueDate ? moment(task.dueDate).format(dateFormat) : null,
                  task.startDate ? moment(task.startDate).format(dateFormat) : null,
                  task.description ? task.description : null,
                  watchers,
                  notes,
                  checklist,
                  task.reminderStartDate ? task.reminderStartDate : null,
                  task.reminderDueDate ? task.reminderDueDate : null,
                  task.estimation ? task.estimation : null,
                  getMapId(task.createdBy, "users")
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
          bpmnDiagrams.forEach((diagram) => {
            Meteor.call("processDiagrams.create",
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
          Canvas.insert({
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
          healthReports.forEach((healthReport) => {
            Meteor.call("healthReports.create",
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
          meetings.forEach((meeting) => {
            let attendees = Array.isArray(meeting?.attendees) ? meeting?.attendees : null;
            if (attendees.length > 0) {
              attendees = attendees.map((attendee) => {
                if (attendee.userId) {
                  attendee.userId = getMapId(attendee.userId, "users");
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
            Meteor.call("meetings.create",
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
      Meteor.call("projects.updateState", {
        projectId: createdProjectId,
        state: project.state
      });

      return createdProjectId;
    } catch (error) {
      /* eslint no-console:off */
      console.log("Error import", error);
      // Error state
      if (createdProjectId) {
        Meteor.call("projects.updateState", {
          projectId: createdProjectId,
          state: ProjectStates.ERROR
        });
      }
      throw error;
    }
  }
});
