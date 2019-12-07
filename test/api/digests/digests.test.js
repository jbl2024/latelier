import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Digests } from "/imports/api/digests/digests";
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

    it("new task generate digest", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const digest = Digests.findOne({
        taskId: task._id
      });

      expect(digest).to.not.be.null;
      expect(digest.taskId).to.be.equal(task._id);
      expect(digest.projectId).to.be.equal(task.projectId);
    });

    it("update task generate digest", async function() {
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

      Meteor.call("tasks.clone", task._id, task.name, task.projectId);

      expect(Digests.find().count()).to.be.equal(3);
    });

    it("complete/uncomplete task generate only one digest (latest state)", async function() {
      createProject();

      const task = Meteor.call(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      Meteor.call("tasks.complete", task._id, true);
      expect(Digests.find().fetch()[1].type).to.be.equal("tasks.complete");

      Meteor.call("tasks.complete", task._id, false);
      expect(Digests.find().fetch()[1].type).to.be.equal("tasks.uncomplete");

      Meteor.call("tasks.complete", task._id, true);
      expect(Digests.find().fetch()[1].type).to.be.equal("tasks.complete");

      Meteor.call("tasks.complete", task._id, false);
      expect(Digests.find().fetch()[1].type).to.be.equal("tasks.uncomplete");
    });
  });
}
