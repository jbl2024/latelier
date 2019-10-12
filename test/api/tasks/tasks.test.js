import assert from "assert";
import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { Lists } from "/imports/api/lists/lists";
import { Tasks } from "/imports/api/tasks/tasks";
import { Labels } from "/imports/api/labels/labels";
import { ProjectStates } from "/imports/api/projects/projects";
import { Permissions } from "/imports/api/permissions/permissions"
import { createStubs, restoreStubs } from "/test/stubs"


function createProject (name) {
  name = name || "project";
  const projectId = Meteor.call("projects.create", {
    name: name,
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
      const userId = Meteor.users.findOne()._id;
      createProject();

      const task = Meteor.call("tasks.insert", Projects.findOne()._id, Lists.findOne()._id, "a name");
      expect(task).to.not.be.null;
      expect(task.number).to.be.a("number");
    });
  });
}