import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Projects } from "/imports/api/projects/projects";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("healthReports", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("must be logged in", async function() {
      const context = {};
      let errorCode;

      const args = {
        projectId: "0",
        name: "name",
        description: "description",
        date: "2019-01-01",
        weather: "cloudy"
      };
      try {
        await HealthReports.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });

    it("creates a new report", async function() {
      const context = { userId: (await Meteor.users.findOneAsync())._id };

      const args = {
        projectId: (await Projects.findOneAsync())._id,
        name: "name",
        description: "description",
        date: "2019-01-01",
        weather: "cloudy"
      };
      await HealthReports.methods.create._execute(context, args);
      expect(HealthReports.find().count()).to.be.equal(1);
    });

    it("remove project remove all reports", async function() {
      const context = { userId: await Meteor.users.findOneAsync()._id };

      const args = {
        projectId: (await Projects.findOneAsync())._id,
        name: "name",
        description: "description",
        date: "2019-01-01",
        weather: "cloudy"
      };
      await HealthReports.methods.create._execute(context, args);
      await HealthReports.methods.create._execute(context, args);
      await HealthReports.methods.create._execute(context, args);
      expect(await HealthReports.find().countAsync()).to.be.equal(3);

      await Meteor.callAsync("projects.deleteForever", {
        projectId: (await Projects.findOneAsync())._id
      });

      expect(await HealthReports.find().countAsync()).to.be.equal(0);
    });
  });
}
