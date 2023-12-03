import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Lists } from "/imports/api/lists/lists";
import { createStubs, restoreStubs } from "/test/stubs";

async function createProject(name) {
  name = name || "project";
  const projectId = await Meteor.callAsync("projects.create", {
    name,
    projectType: "kanban",
    state: ProjectStates.PRODUCTION
  });
  await Meteor.callAsync("lists.insert", projectId, "list1", false, false);
}

if (Meteor.isServer) {
  describe("search (anonymous)", function() {
    beforeEach(async function() {
      await initData();
    });

    afterEach(function() {});

    it("must be logged in", async function() {
      let errorCode;

      try {
        await Meteor.callAsync("search.findTasks", {
          name: ""
        });
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );

      try {
        await Meteor.callAsync("search.findProjects", {
          name: ""
        });
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });
  });

  describe("search", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("task is displayed to user", async function() {
      await createProject();
      await Meteor.callAsync(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const result = await Meteor.callAsync("search.findTasks", { name: "a" });
      expect(result.totalItems).to.be.equal(1);

      await Meteor.callAsync("projects.updateState", {
        projectId: Projects.findOne()._id,
        state: ProjectStates.ARCHIVED
      });

      const result2 = await Meteor.callAsync("search.findTasks", { name: "a" });
      expect(result2.totalItems).to.be.equal(0);
    });

    it("project is displayed to user", async function() {
      await createProject();
      const result = await Meteor.callAsync("search.findProjects", { name: "project" });
      expect(result.totalItems).to.be.equal(1);

      await Meteor.callAsync("projects.updateState", {
        projectId: result.data[0]._id,
        state: ProjectStates.ARCHIVED
      });

      const result2 = await Meteor.callAsync("search.findProjects", { name: "project" });
      expect(result2.totalItems).to.be.equal(0);
    });

    it("nothing is displayed to new user", async function() {
      await createProject();
      await Meteor.callAsync(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const userData = {
        createdAt: new Date(),
        email: "anotheruser@bar.com"
      };

      const otherUserId = Accounts.createUser(userData);

      restoreStubs();
      createStubs(otherUserId);
      const result = await Meteor.callAsync("search.findTasks", { name: "a" });
      expect(result.totalItems).to.be.equal(0);

      const resultProject = await Meteor.callAsync("search.findProjects", { name: "a" });
      expect(resultProject.totalItems).to.be.equal(0);
    });
  });
}
