import assert from "assert";
import { expect } from 'chai';
import { initData } from "/test/fixtures/fixtures";
import { HealthReports } from "/imports/api/healthReports/healthReports"
import { Projects } from "/imports/api/projects/projects"
import { createStubs, restoreStubs } from "/test/stubs"
if (Meteor.isServer) {

  describe("healthReports", function() {
    beforeEach(function() {
      initData();
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
      }
      try {
        HealthReports.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }      
      expect(errorCode, 'should throw not logged in').to.be.equal("not-authorized");
    });

    it("creates a new report", async function() {
      const context = {userId: Meteor.users.findOne()._id};
      let errorCode;

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        description: "description",
        date: "2019-01-01",
        weather: "cloudy"
      }
      HealthReports.methods.create._execute(context, args);
      expect(HealthReports.find().count()).to.be.equal(1);
    });

    it("remove project remove all reports", async function() {
      const context = {userId: Meteor.users.findOne()._id};
      let errorCode;

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        description: "description",
        date: "2019-01-01",
        weather: "cloudy"
      }
      HealthReports.methods.create._execute(context, args);
      HealthReports.methods.create._execute(context, args);
      HealthReports.methods.create._execute(context, args);
      expect(HealthReports.find().count()).to.be.equal(3);

      Meteor.call("projects.deleteForever", {
        projectId: Projects.findOne()._id
      });

      expect(HealthReports.find().count()).to.be.equal(0);

    });

  });

}

