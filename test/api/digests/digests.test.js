import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Digests } from "/imports/api/digests/digests";
import { Lists } from "/imports/api/lists/lists";
import { createStubs, restoreStubs } from "/test/stubs";

import moment from "moment";

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

    it("new task generate digest", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );
      Meteor._sleepForMs(100);

      const digest = Digests.findOne({
        taskId: task._id
      });

      expect(digest).to.not.be.null;
      expect(digest.taskId).to.be.equal(task._id);
      expect(digest.projectId).to.be.equal(task.projectId);
    });

    it("update task generate digest", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      const labelId = await Meteor.callAsync("labels.create", {
        projectId: Projects.findOne()._id,
        name: "label",
        color: "black"
      });

      await Meteor.callAsync("tasks.addNote", task._id, "note1");
      await Meteor.callAsync("tasks.addNote", task._id, "note2");

      await Meteor.callAsync("tasks.addLabel", task._id, labelId);

      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check1");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check2");
      await Meteor.callAsync("tasks.addChecklistItem", task._id, "check3");

      await Meteor.callAsync("tasks.clone", task._id, task.name, task.projectId);

      Meteor._sleepForMs(100);

      expect(await Digests.find().countAsync()).to.be.equal(3);
    });

    it("complete/uncomplete task generate only one digest (latest state)", async function() {
      await createProject();

      const task = await Meteor.callAsync(
        "tasks.insert",
        Projects.findOne()._id,
        Lists.findOne()._id,
        "a name"
      );

      await Meteor.callAsync("tasks.complete", task._id, true);
      Meteor._sleepForMs(100);
      expect((await Digests.find().fetchAsync())[1].type).to.be.equal("tasks.complete");

      await Meteor.callAsync("tasks.complete", task._id, false);
      Meteor._sleepForMs(100);
      expect((await Digests.find().fetchAsync())[1].type).to.be.equal("tasks.uncomplete");

      await Meteor.callAsync("tasks.complete", task._id, true);
      Meteor._sleepForMs(100);
      expect((await Digests.find().fetchAsync())[1].type).to.be.equal("tasks.complete");

      await Meteor.callAsync("tasks.complete", task._id, false);
      Meteor._sleepForMs(100);
      expect((await Digests.find().fetchAsync())[1].type).to.be.equal("tasks.uncomplete");
    });

    it("purge remove only obsolete digests", async function() {
      for (let i = 0; i < 100; i++) {
        const when = moment().startOf("day").subtract(i, "days").toDate();
        // eslint-disable-next-line no-await-in-loop
        await Digests.insertAsync({
          type: "foo",
          when: when,
          projectId: "projectId"
        });

        // eslint-disable-next-line no-await-in-loop
        await Digests.insertAsync({
          type: "bar",
          when: when,
          projectId: "projectId"
        });

        // eslint-disable-next-line no-await-in-loop
        await Digests.insertAsync({
          type: "foo",
          when: when,
          projectId: "anotherProjectId"
        });

        // eslint-disable-next-line no-await-in-loop
        await Digests.insertAsync({
          type: "bar",
          when: when,
          projectId: "anotherProjectId"
        });
      }

      const keep = 60;

      expect(await Digests.find().countAsync()).to.be.equal(200 + 200);
      await Meteor.callAsync("digests.purge", { projectId: "projectId" });
      Meteor._sleepForMs(100);
      expect(Digests.find({ projectId: "anotherProjectId" }).count()).to.be.equal(200);
      expect(Digests.find({ projectId: "projectId" }).count()).to.be.equal(keep * 2);
    });
  });
}
