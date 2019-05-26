import assert from "assert";
import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { ProjectStates } from "/imports/api/projects/projects";
import { Labels } from "/imports/api/labels/labels";
import { createStubs, restoreStubs } from "/test/stubs"

if (Meteor.isServer) {
  
  describe("labels", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("label crud should work", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};
      const projectA_id = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      })
      expect(projectA_id).to.not.be.null;

      Labels.methods.create._execute(context, {
        projectId: projectA_id,
        name: "a label",
        color: "a color"
      });

      expect(Labels.find().count()).to.equal(1);
    });

    it("clone labels should create 2 instances", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};
      const projectA_id = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      })
      expect(projectA_id).to.not.be.null;
      const projectB_id = Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      })
      expect(projectB_id).to.not.be.null;

      Labels.methods.create._execute(context, {
        projectId: projectA_id,
        name: "a label",
        color: "a color"
      });

      Labels.methods.import._execute(context, {
        from: projectA_id,
        to: projectB_id,
      });

      expect(Labels.find().count()).to.equal(2);

      expect(Labels.find({projectId: projectA_id}).count()).to.equal(1);
      expect(Labels.find({projectId: projectB_id}).count()).to.equal(1);
    });
  });
}