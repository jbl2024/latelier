import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { Canvas } from "/imports/api/canvas/canvas";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("canvas", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("only one canvas is automatically created", async function() {
      const projectId = (await Projects.findOneAsync())._id;
      const canvas = await Meteor.callAsync("canvas.get", projectId);
      expect(canvas).to.not.be.null;
      expect(canvas.projectId).to.be.equal(projectId);

      expect(await Canvas.find().countAsync()).to.be.equal(1);

      await Meteor.callAsync("canvas.get", projectId);
      await Meteor.callAsync("canvas.get", projectId);
      expect(await Canvas.find().countAsync()).to.be.equal(1);
    });

    it("canvas is updated", async function() {
      const projectId = (await Projects.findOneAsync())._id;
      const canvas = await Meteor.callAsync("canvas.get", projectId);
      expect(canvas).to.not.be.null;
      expect(canvas.projectId).to.be.equal(projectId);
      expect(canvas.data.goal).to.be.equal("");

      await Meteor.callAsync("canvas.update", projectId, {
        goal: "goal"
      });

      expect((await Canvas.findOneAsync({ projectId })).data.goal).to.be.equal(
        "goal"
      );

      await Meteor.callAsync("canvas.update", projectId, {
        budget: "budget"
      });

      expect((await Canvas.findOneAsync({ projectId })).data.goal).to.be.equal(
        "goal"
      );
      expect((await Canvas.findOneAsync({ projectId })).data.budget).to.be.equal(
        "budget"
      );
    });
  });
}
