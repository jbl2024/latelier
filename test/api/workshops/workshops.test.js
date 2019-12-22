import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Workshops } from "/imports/api/workshops/workshops";
import { Projects } from "/imports/api/projects/projects";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("workshops.create", function() {
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
        description: "description"
      };
      try {
        Workshops.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });

    it("creates a new workshop", async function() {
      const context = { userId: Meteor.users.findOne()._id };

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        description: "description"
      };
      Workshops.methods.create._execute(context, args);
      expect(Workshops.find().count()).to.be.equal(1);
    });
  });
}
