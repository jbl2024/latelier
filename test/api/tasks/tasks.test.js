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
  describe("tasks", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("new task has generated number", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );
      expect(task).to.not.be.null;
      expect(task.number).to.be.a("number");
    });

    it("cloned task has notes & checklist & labels", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const labelId = Meteor.call("labels.create", {
        projectId: Projects.findOne()._id,
        name: "label",
        color: "black"
      });

      Meteor.call("tasks.addNote", task._id, "note1");
      Meteor.call("tasks.addNote", task._id, "note2");

      Meteor.call("tasks.addLabel", task._id, labelId);

      Meteor.call("tasks.addChecklistItem", task._id, "check1");
      Meteor.call("tasks.addChecklistItem", task._id, "check2");
      Meteor.call("tasks.addChecklistItem", task._id, "check3");

      const clonedTask = Meteor.call("tasks.clone", task._id, task.name, task.projectId);

      expect(clonedTask.notes).to.have.lengthOf(2);
      expect(clonedTask.checklist).to.have.lengthOf(3);
      expect(clonedTask.labels).to.have.lengthOf(1);
    });

    it("checklist converted from task has labels", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const labelId = Meteor.call("labels.create", {
        projectId: Projects.findOne()._id,
        name: "label",
        color: "black"
      });

      Meteor.call("tasks.addLabel", task._id, labelId);

      Meteor.call("tasks.addChecklistItem", task._id, "check1");
      Meteor.call("tasks.addChecklistItem", task._id, "check2");
      const checkItemId = Meteor.call("tasks.addChecklistItem", task._id, "check3");

      const convertedTask = Meteor.call("tasks.convertItemToTask", task._id, checkItemId);
      expect(convertedTask.labels).to.have.lengthOf(1);
    });

    it("checklist converted from task has name of check item", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      Meteor.call("tasks.addChecklistItem", task._id, "check1");
      Meteor.call("tasks.addChecklistItem", task._id, "check2");
      const checkItemId = Meteor.call("tasks.addChecklistItem", task._id, "check3");

      const convertedTask = Meteor.call("tasks.convertItemToTask", task._id, checkItemId);
      expect(convertedTask.name).to.be.equal("check3");
    });


    it("only members can create tasks", async function() {
      let errorCode;

      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );
      expect(task).to.not.be.null;
      expect(task.number).to.be.a("number");

      const userData = {
        createdAt: new Date(),
        email: "anotheruser@bar.com"
      };

      const otherUserId = Accounts.createUser(userData);

      restoreStubs();
      createStubs(otherUserId);
      try {
        Meteor.call(
          "tasks.insert",
          Projects.findOne()._id,
          Lists.findOne()._id,
          "a name"
        );
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
      restoreStubs();
      createStubs(task.createdBy);

      Meteor.call("projects.addMember", {
        projectId: Projects.findOne()._id,
        userId: otherUserId
      });

      restoreStubs();
      createStubs(otherUserId);
      const newTask = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );
      expect(newTask.createdBy).to.be.equal(otherUserId);
    });
  });
}
