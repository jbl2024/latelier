import { expect } from "chai";
import { Lists } from "/imports/api/lists/lists";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { initData } from "/test/fixtures/fixtures";
import { createStubs, restoreStubs } from "/test/stubs";

function createProject(name) {
  name = name || "project";
  const projectId = Meteor.call("projects.create", {
    name,
    projectType: "kanban",
    state: ProjectStates.PRODUCTION
  });
  Meteor.call("lists.insert", projectId, "list1", false, false);
}

if (Meteor.isServer) {
  describe("dashboards (anonymous)", function() {
    beforeEach(async function() {
      await initData();
    });

    afterEach(function() {});

    it("must be logged in", async function() {
      let errorCode;

      try {
        await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });
  });

  describe("dashboards", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("task is displayed to user", async function() {
      createProject();
      Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const result = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result.totalItems).to.be.equal(1);
    });

    it("task from archived project is not displayed to user", async function() {
      createProject();
      Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const result = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result.totalItems).to.be.equal(1);

      Meteor.call("projects.updateState", {
        projectId: Projects.findOne()._id,
        state: ProjectStates.ARCHIVED
      });

      const result2 = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result2.totalItems).to.be.equal(0);

      const result3 = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1, true /* showArchivedProject = true */);
      expect(result3.totalItems).to.be.equal(1);
    });

    it("nothing is displayed to new user", async function() {
      createProject();
      Meteor.call(
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
      const result = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result.totalItems).to.be.equal(0);
    });
  });
}
