import { expect } from "chai";
import { Lists } from "/imports/api/lists/lists";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { initData } from "/test/fixtures/fixtures";
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
      await createProject();
      await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );

      const result = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result.totalItems).to.be.equal(1);
    });

    it("task from archived project is not displayed to user", async function() {
      await createProject();
      await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );

      const result = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result.totalItems).to.be.equal(1);

      await Meteor.callAsync("projects.updateState", {
        projectId: (await Projects.findOneAsync())._id,
        state: ProjectStates.ARCHIVED
      });

      const result2 = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1);
      expect(result2.totalItems).to.be.equal(0);

      const result3 = await Meteor.callAsync("dashboards.findTasks", "recent", null, null, 1, true /* showArchivedProject = true */);
      expect(result3.totalItems).to.be.equal(1);
    });

    it("nothing is displayed to new user", async function() {
      await createProject();
      await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
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
