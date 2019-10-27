import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";

import { Labels } from "/imports/api/labels/labels";
import { createStubs, restoreStubs } from "/test/stubs";

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
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      Labels.methods.create._execute(context, {
        projectId: projectAid,
        name: "a label",
        color: "a color"
      });

      expect(Labels.find().count()).to.equal(1);
    });

    it("clone labels should create 2 instances", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;
      const projectBid = Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectBid).to.not.be.null;

      Labels.methods.create._execute(context, {
        projectId: projectAid,
        name: "a label",
        color: "a color"
      });

      Labels.methods.import._execute(context, {
        from: projectAid,
        to: projectBid
      });

      expect(Labels.find().count()).to.equal(2);

      expect(Labels.find({ projectId: projectAid }).count()).to.equal(1);
      expect(Labels.find({ projectId: projectBid }).count()).to.equal(1);
    });
  });
}
