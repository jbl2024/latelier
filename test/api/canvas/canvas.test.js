import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { Canvas } from "/imports/api/canvas/canvas";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("canvas", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("only one canvas is automatically created", async function() {
      const projectId = Projects.findOne()._id;
      const canvas = Meteor.call("canvas.get", projectId);
      expect(canvas).to.not.be.null;
      expect(canvas.projectId).to.be.equal(projectId);

      expect(Canvas.find().count()).to.be.equal(1);

      Meteor.call("canvas.get", projectId);
      Meteor.call("canvas.get", projectId);
      expect(Canvas.find().count()).to.be.equal(1);
    });

    it("canvas is updated", async function() {
      const projectId = Projects.findOne()._id;
      const canvas = Meteor.call("canvas.get", projectId);
      expect(canvas).to.not.be.null;
      expect(canvas.projectId).to.be.equal(projectId);
      expect(canvas.data.goal).to.be.equal("");

      Meteor.call("canvas.update", projectId, {
        goal: "goal"
      });

      expect(Canvas.findOne({ projectId }).data.goal).to.be.equal(
        "goal"
      );

      Meteor.call("canvas.update", projectId, {
        budget: "budget"
      });

      expect(Canvas.findOne({ projectId }).data.goal).to.be.equal(
        "goal"
      );
      expect(Canvas.findOne({ projectId }).data.budget).to.be.equal(
        "budget"
      );
    });
  });
}
