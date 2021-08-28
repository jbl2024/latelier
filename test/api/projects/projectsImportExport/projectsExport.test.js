import { expect } from "chai";
import { initData, createProject } from "/test/fixtures/fixtures";
import JSZip from "jszip";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("projectsExport V2020_11", function () {
    beforeEach(function () {
      initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("export project is only available for project admin members", async function () {
      let errorCode;
      const user = Meteor.users.findOne();
      const userId = user._id;
      const projectId = createProject({ userId });
      expect(projectId).to.not.be.null;

      const anotherUserId = Meteor.users.findOne({
        _id: { $ne: userId }
      });

      restoreStubs();
      createStubs(anotherUserId);

      try {
        Meteor.call("projects.export", { projectId });
      } catch (error) {
        errorCode = error.error;
      }

      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });

    it("export project should create a valid zip", async function () {
      let errorCode = null;
      let zipContent;
      const user = Meteor.users.findOne();
      const userId = user._id;
      const projectId = createProject({ userId });
      expect(projectId).to.not.be.null;

      try {
        zipContent = Meteor.call("projects.export", { projectId });
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should not throw error").to.equal(null);
      expect(zipContent, "should be an object").to.be.a("object");
      expect(zipContent, "should have a data property").to.have.property("data");
      expect(zipContent.data, "should not be empty").to.not.be.empty;
      expect(zipContent.data.constructor, "should be a Uint8Array type array").to.equal(Uint8Array);

      const zip = await JSZip.loadAsync(zipContent.data);

      expect(zip, "should be an object").to.be.a("object");
      expect(zip, "should have a files property").to.have.property("files");
      expect(zip.files, "should be an object").to.be.a("object");

      const projectFolderName = `${projectId}/`;
      expect(zip.files, "should contains the related zipped project folder").to.have.property(projectFolderName);

      expect(zip.files[projectFolderName], "should be an object").to.be.a("object");

      expect(zip.files[projectFolderName], "should be a jszip folder object").to.includes.keys(["name", "dir", "date", "_dataBinary"]);
      expect(zip.files[projectFolderName].dir, "should be a directory").to.be.equal(true);
      expect(zip.files[projectFolderName]._dataBinary, "should be binary data").to.be.equal(true);
    });
  });
}
