import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Meetings } from "/imports/api/meetings/meetings";
import { Projects } from "/imports/api/projects/projects";
import { createStubs, restoreStubs } from "/test/stubs";

import moment from "moment";

if (Meteor.isServer) {
  describe("meetings", function() {
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
        state: "pending",
        startDate: moment().format("YYYY-MM-DD HH:00"),
        endDate: moment().format("YYYY-MM-DD HH:00")
      };
      try {
        Meetings.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });

    it("creates a new meeting", async function() {
      const context = { userId: Meteor.users.findOne()._id };

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        state: "pending",
        startDate: moment().format("YYYY-MM-DD HH:00"),
        endDate: moment().format("YYYY-MM-DD HH:00")
      };
      Meetings.methods.create._execute(context, args);
      expect(Meetings.find().count()).to.be.equal(1);
    });

    it("remove project remove all meetings", async function() {
      const context = { userId: Meteor.users.findOne()._id };
      const projectId = Projects.findOne()._id;

      const args = {
        projectId: projectId,
        name: "name",
        state: "pending",
        startDate: moment().format("YYYY-MM-DD HH:00"),
        endDate: moment().format("YYYY-MM-DD HH:00")
      };
      Meetings.methods.create._execute(context, args);
      Meetings.methods.create._execute(context, args);
      Meetings.methods.create._execute(context, args);
      expect(Meetings.find().count()).to.be.equal(3);

      Meteor.call("projects.deleteForever", {
        projectId: Projects.findOne()._id
      });

      expect(Meetings.find().count()).to.be.equal(0);
    });
  });
}
