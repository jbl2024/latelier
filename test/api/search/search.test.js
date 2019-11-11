import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Lists } from "/imports/api/lists/lists";
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
  describe("search (anonymous)", function() {
    beforeEach(function() {
      initData();
    });

    afterEach(function() {});

    it("must be logged in", async function() {
      let errorCode;

      try {
        Meteor.call("search.findTasks", {
          name: ""
        });
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );

      try {
        Meteor.call("search.findProjects", {
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
    beforeEach(function() {
      initData();
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

      const result = Meteor.call("search.findTasks", { name: "a" });
      expect(result.totalItems).to.be.equal(1);
    });

    it("project is displayed to user", async function() {
      createProject();
      const result = Meteor.call("search.findProjects", { name: "project" });
      expect(result.totalItems).to.be.equal(1);
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
      const result = Meteor.call("search.findTasks", { name: "a" });
      expect(result.totalItems).to.be.equal(0);

      const resultProject = Meteor.call("search.findProjects", { name: "a" });
      expect(resultProject.totalItems).to.be.equal(0);
    });
  });
}
