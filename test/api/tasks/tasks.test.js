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
  describe("tasks", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("new task has generated number", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );
      expect(task).to.not.be.null;
      expect(task.number).to.be.a("number");
    });

    it("cloned task has notes & checklist & labels", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );

      const labelId = await Meteor.callAsync("labels.create", {
        projectId: (await Projects.findOneAsync())._id,
        name: "label",
        color: "black"
      });

      await Meteor.callAsync("tasks.addNote", task._id, "note1");
      await Meteor.callAsync("tasks.addNote", task._id, "note2");

      await Meteor.callAsync("tasks.addLabel", task._id, labelId);

      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check1");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check2");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check3");

      const clonedTask = await Meteor.callAsync("tasks.clone", task._id, task.name, task.projectId);

      expect(clonedTask.notes).to.have.lengthOf(2);
      expect(clonedTask.checklist).to.have.lengthOf(3);
      expect(clonedTask.labels).to.have.lengthOf(1);
    });

    it("checklist converted from task has labels", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );

      const labelId = await Meteor.callAsync("labels.create", {
        projectId: (await Projects.findOneAsync())._id,
        name: "label",
        color: "black"
      });

      await Meteor.callAsync("tasks.addLabel", task._id, labelId);

      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check1");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check2");
      const checkItemId = await Meteor.callAsync("tasks.addChecklistItem", task._id, "check3");

      const convertedTask = await Meteor.callAsync("tasks.convertItemToTask", task._id, checkItemId);
      expect(convertedTask.labels).to.have.lengthOf(1);
    });

    it("checklist converted from task has name of check item", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );

      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check1");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check2");
      const checkItemId = await Meteor.callAsync("tasks.addChecklistItem", task._id, "check3");

      const convertedTask = await Meteor.callAsync("tasks.convertItemToTask", task._id, checkItemId);
      expect(convertedTask.name).to.be.equal("check3");
    });

    it("only members can create tasks", async function() {
      let errorCode;

      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
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
        await Meteor.callAsync(
          "tasks.insert",
          (await Projects.findOneAsync())._id,
          (await Lists.findOneAsync())._id,
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

      await Meteor.callAsync("projects.addMember", {
        projectId: (await Projects.findOneAsync())._id,
        userId: otherUserId
      });

      restoreStubs();
      createStubs(otherUserId);
      const newTask = await Meteor.callAsync(
        "tasks.insert",
        (await Projects.findOneAsync())._id,
        (await Lists.findOneAsync())._id,
        "a name"
      );
      expect(newTask.createdBy).to.be.equal(otherUserId);
    });
  });
}
