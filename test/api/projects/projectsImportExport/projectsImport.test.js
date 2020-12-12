import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { makeProjectDatas } from "/test/fixtures/projects/projectsImportExport";
import { createProjectExportZip } from "/imports/api/projects/importExport";
import { Projects, ProjectAccessRights } from "/imports/api/projects/projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { Canvas } from "/imports/api/canvas/canvas";
import { Labels } from "/imports/api/labels/labels";
import { Lists } from "/imports/api/lists/lists";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Meetings } from "/imports/api/meetings/meetings";
import { createStubs, restoreStubs } from "/test/stubs";
import { Roles } from "meteor/alanning:roles";

createProjectZip = async (datas) => {
  const zip = await createProjectExportZip(datas);
  return zip;
};

// We'll use this zipped project in every test
stepCreateProjectZip = async (projectDatas) => {
  let createZipErrorCode = null;
  let zipContent;
  let zip;
  try {
    zip = await createProjectZip(projectDatas);
    zipContent = await zip.generateAsync({ type: "uint8array" });
  } catch (error) {
    createZipErrorCode = error.error;
  }
  expect(createZipErrorCode, "should not throw error").to.equal(null);
  expect(zip, "should be an object").to.be.a("object");
  expect(zip, "should have a files property").to.have.property("files");
  expect(zip.files, "should be an object").to.be.a("object");

  const projectFolderName = `${projectDatas.project._id}/`;
  expect(zip.files, "should contains the related zipped project folder").to.have.property(projectFolderName);
  expect(zip.files[projectFolderName], "should be an object").to.be.a("object");
  expect(zip.files[projectFolderName], "should be a jszip folder object").to.includes.keys(["name", "dir", "date", "_dataBinary"]);
  expect(zip.files[projectFolderName].dir, "should be a directory").to.be.equal(true);
  expect(zip.files[projectFolderName]._dataBinary, "should be binary data").to.be.equal(true);

  expect(zipContent.constructor, "should be a Uint8Array type array").to.equal(Uint8Array);
  return { zip, zipContent };
};


if (Meteor.isServer) {
  describe("projectsImport V2020_11", function () {
    beforeEach(function () {
      initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("import project is only available for project admin members", async function () {
      let createZipErrorCode = null;
      let errorCode;
      let zipContent;
      let zip;

      const projectDatas = makeProjectDatas();
      const user = Meteor.users.findOne();
      const userId = user._id;

      const anotherUserId = Meteor.users.findOne({
        _id: { $ne: userId }
      });

      restoreStubs();
      createStubs(anotherUserId);

      try {
        zip = await createProjectZip(projectDatas);
        zipContent = await zip.generateAsync({ type: "uint8array" });
      } catch (error) {
        createZipErrorCode = error.error;
      }
      expect(createZipErrorCode, "should throw error").to.equal(null);
      expect(zip, "should be an object").to.be.a("object");
      expect(zipContent.constructor, "should be a Uint8Array type array").to.equal(Uint8Array);

      try {
        Meteor.call("projects.import", {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name
        });
      } catch (error) {
        errorCode = error.error;
      }

      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });


    it("import project must create a valid project", async function () {
      let importErrorCode = null;
      let createdProjectId = null;
      const projectDatas = makeProjectDatas();
      const { zipContent } = await stepCreateProjectZip(projectDatas);

      try {
        const userId = Meteor.users.findOne()._id;
        Roles.addUsersToRoles(userId, "admin", Roles.GLOBAL_GROUP);
        const context = { userId };
        const args = {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name,
          organizationId: null,
          accessRights: ProjectAccessRights.ORGANIZATION
        };
        createdProjectId = await Projects.methods.import._execute(context, args);
      } catch (error) {
        importErrorCode = error.error;
      }
      expect(importErrorCode, "should not throw error").to.equal(null);

      // Checking project
      expect(createdProjectId, "should be a string").to.be.a("string");
      expect(createdProjectId, "should be a valid projectId").to.not.be.empty;
      const project = Projects.findOne({ _id: createdProjectId });
      expect(project, "should be an object").to.be.a("object");
      expect(project, "should have an _id property").to.have.property("_id");
      expect(project._id, "should have the same id").to.be.equal(createdProjectId);

      const projectFields = ["name", "state", "description", "color", "features", "startDate", "endDate"];
      expect(project, "should have project fields").to.includes.keys(projectFields);

      // Checking main project fields
      projectFields.forEach((key) => {
        const imported = projectDatas.project[key];
        if (key === "features") {
          expect(project.features, "shoud be an array").to.be.an("array");
          imported.forEach((feat) => {
            expect(project.features, "should includes same feature").to.include(feat);
          });
        } else if (Array.isArray(imported)) {
          expect(project[key], "should be same value").to.be.equal(imported);
        }
      });
    });

    it("import project must create only specified project items", async function() {
      let importErrorCode = null;
      let createdProjectId = null;
      const projectDatas = makeProjectDatas();
      const { zipContent } = await stepCreateProjectZip(projectDatas);

      try {
        const userId = Meteor.users.findOne()._id;
        Roles.addUsersToRoles(userId, "admin", Roles.GLOBAL_GROUP);
        const context = { userId };
        const args = {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name,
          organizationId: null,
          items: ["meetings"],
          accessRights: ProjectAccessRights.ORGANIZATION
        };
        createdProjectId = await Projects.methods.import._execute(context, args);
      } catch (error) {
        importErrorCode = error.error;
      }

      expect(importErrorCode, "should not throw error").to.equal(null);
      expect(createdProjectId, "should be a string").to.be.a("string");
      expect(createdProjectId, "should be a valid projectId").to.not.be.empty;

      // Checking project
      const project = Projects.findOne({ _id: createdProjectId });
      expect(project, "should be an object").to.be.a("object");
      expect(project, "should have an _id property").to.have.property("_id");
      expect(project._id, "should have the same id").to.be.equal(createdProjectId);

      // Item type that should be imported
      const importedMeetingName = projectDatas.meetings[0].name;
      const meeting = Meetings.findOne({
        projectId: createdProjectId,
        name: importedMeetingName
      });

      expect(meeting, "should be an object").to.be.a("object");
      expect(meeting, "should have an _id property").to.have.property("_id");
      expect(meeting._id, "should be a string").to.be.a("string");
      expect(meeting, "should have an name property").to.have.property("name");
      expect(meeting.name, "should be a string").to.be.a("string");
      expect(meeting.name, "should be equal to imported meeting name").to.be.equal(importedMeetingName);

      // Other items that should not be imported
      canvas = Canvas.findOne({ projectId: createdProjectId });
      expect(canvas, "should be undefined").to.be.undefined;

      tasks = Tasks.find({ projectId: createdProjectId }).fetch();
      expect(tasks, "should be empty").to.be.empty;

      labels = Labels.find({ projectId: createdProjectId }).fetch();
      expect(labels, "should be empty").to.be.empty;

      healthReports = HealthReports.find({ projectId: createdProjectId }).fetch();
      expect(healthReports, "should be empty").to.be.empty;
    });

    it("import project must create valid canvas", async function () {
      let importErrorCode = null;
      let createdProjectId = null;
      const projectDatas = makeProjectDatas();
      const { zipContent } = await stepCreateProjectZip(projectDatas);

      try {
        const userId = Meteor.users.findOne()._id;
        Roles.addUsersToRoles(userId, "admin", Roles.GLOBAL_GROUP);
        const context = { userId };
        const args = {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name,
          organizationId: null
        };
        createdProjectId = await Projects.methods.import._execute(context, args);
      } catch (error) {
        importErrorCode = error.error;
      }

      expect(importErrorCode, "should not throw error").to.equal(null);


      // Checking project
      expect(createdProjectId, "should be a string").to.be.a("string");
      expect(createdProjectId, "should be a valid projectId").to.not.be.empty;
      const project = Projects.findOne({ _id: createdProjectId });
      expect(project, "should be an object").to.be.a("object");
      expect(project, "should have an _id property").to.have.property("_id");
      expect(project._id, "should have the same id").to.be.equal(createdProjectId);

      const canvas = Canvas.findOne({ projectId: createdProjectId });
      expect(canvas, "should be an object").to.be.a("object");
      expect(canvas, "should have an _id property").to.have.property("_id");
      expect(canvas, "should have a data property").to.have.property("data");

      Object.keys(projectDatas.canvas.data).forEach((field) => {
        expect(canvas.data, "should have a data property").to.have.property(field);
        expect(canvas.data[field], "should have the correct value").to.equal(projectDatas.canvas.data[field]);
      });
    });


    it("import project must create valid health reports", async function() {
      let importErrorCode = null;
      let createdProjectId = null;
      const projectDatas = makeProjectDatas();
      const { zipContent } = await stepCreateProjectZip(projectDatas);

      try {
        const userId = Meteor.users.findOne()._id;
        Roles.addUsersToRoles(userId, "admin", Roles.GLOBAL_GROUP);
        const context = { userId };
        const args = {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name,
          organizationId: null
        };
        createdProjectId = await Projects.methods.import._execute(context, args);
      } catch (error) {
        importErrorCode = error.error;
      }

      expect(importErrorCode, "should not throw error").to.equal(null);

      // Checking project
      expect(createdProjectId, "should be a string").to.be.a("string");
      expect(createdProjectId, "should be a valid projectId").to.not.be.empty;
      const project = Projects.findOne({ _id: createdProjectId });
      expect(project, "should be an object").to.be.a("object");
      expect(project, "should have an _id property").to.have.property("_id");
      expect(project._id, "should have the same id").to.be.equal(createdProjectId);

      const healthReports = HealthReports.find({ projectId: createdProjectId }).fetch();
      expect(healthReports, "should be an array of results").to.be.an("array");
      expect(healthReports, "should not be empty").to.not.be.empty;
      expect(healthReports.length, "should have the same size").to.be.equal(projectDatas.healthReports.length);

      healthReports.forEach((healthReport) => {
        expect(healthReport, "should be an object").to.be.a("object");
        expect(healthReport, "should have a valid id").to.have.property("_id");
      });

      const importedReportsDatas = projectDatas.healthReports.map((h) => ({
        name: h.name,
        description: h.description,
        weather: h.weather
      }));

      importedReportsDatas.forEach((data) => {
        const foundReport = healthReports.find((healthReport) => healthReport.name === data.name
          && healthReport.description === data.description
          && healthReport.weather === data.weather);
        expect(foundReport, "should be an object").to.be.a("object");
        expect(foundReport, "should have a valid id").to.have.property("_id");
      });
    });

    it("import project must create valid tasks and labels items", async function() {
      let importErrorCode = null;
      let createdProjectId = null;
      const projectDatas = makeProjectDatas();
      const { zipContent } = await stepCreateProjectZip(projectDatas);

      try {
        const userId = Meteor.users.findOne()._id;
        Roles.addUsersToRoles(userId, "admin", Roles.GLOBAL_GROUP);
        const context = { userId };
        const args = {
          fileBuffer: zipContent,
          locale: "en",
          projectName: projectDatas.project.name,
          organizationId: null
        };
        createdProjectId = await Projects.methods.import._execute(context, args);
      } catch (error) {
        importErrorCode = error.error;
      }

      expect(importErrorCode, "should not throw error").to.equal(null);

      // Checking project
      expect(createdProjectId, "should be a string").to.be.a("string");
      expect(createdProjectId, "should be a valid projectId").to.not.be.empty;
      const project = Projects.findOne({ _id: createdProjectId });
      expect(project, "should be an object").to.be.a("object");
      expect(project, "should have an _id property").to.have.property("_id");
      expect(project._id, "should have the same id").to.be.equal(createdProjectId);

      // Checking labels
      const labels = Labels.find({ projectId: createdProjectId }).fetch();
      expect(labels, "should be an array of results").to.be.an("array");
      expect(labels, "should not be empty").to.not.be.empty;
      expect(labels.length, "should have the same size").to.be.equal(projectDatas.labels.length);

      const importedLabelsDatas = projectDatas.labels.map((l) => ({
        name: l.name,
        color: l.color
      }));

      importedLabelsDatas.forEach((data) => {
        const foundLabel = labels.find((label) => label.name === data.name
          && label.color === data.color);
        expect(foundLabel, "should be an object").to.be.a("object");
        expect(foundLabel, "should have a valid id").to.have.property("_id");
      });

      // Checking lists
      const lists = Lists.find({ projectId: createdProjectId }).fetch();
      expect(lists, "should be an array of results").to.be.an("array");
      expect(lists, "should not be empty").to.not.be.empty;
      expect(lists.length, "should have the same size").to.be.equal(projectDatas.tasksLists.length);

      const importedTasks = [];
      projectDatas.tasksLists.forEach((data) => {
        const foundList = lists.find((taskList) => taskList.name === data.name
          && taskList.autoComplete === data.autoComplete
          && taskList.catchCompleted === data.catchCompleted);
        expect(foundList, "should be an object").to.be.a("object");
        expect(foundList, "should have a valid id").to.have.property("_id");

        if (Array.isArray(data.tasks)) {
          data.tasks.forEach((task) => {
            importedTasks.push({
              projectId: createdProjectId,
              listId: foundList._id,
              name: task.name
            });
          });
        }
      });

      // Check tasks in their related lists
      const tasks = Tasks.find({ projectId: createdProjectId }).fetch();
      expect(tasks, "should be an array of results").to.be.an("array");
      expect(tasks, "should not be empty").to.not.be.empty;

      importedTasks.forEach((importedTask) => {
        const foundTask = tasks.find((t) => t.projectId === importedTask.projectId
          && t.listId === importedTask.listId
          && t.name === importedTask.name);
        expect(foundTask, "should be an object").to.be.a("object");
        expect(foundTask, "should have a valid id").to.have.property("_id");
      });
    });
  });
}
