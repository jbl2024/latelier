import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Organizations } from "/imports/api/organizations/organizations";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe.only("projectsImport V2020_11", function () {
    beforeEach(function () {
      initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });


    it("import project is only available for project admin members", async function () {
      let errorCode;
      try {
        const organization = Organizations.findOne();
        Meteor.call("projects.import", {
          locale: "en",
          organizationId: organization._id,
          fileBuffer
        });
      } catch (error) {
        errorCode = error.error;
      }

      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });
  });
}
