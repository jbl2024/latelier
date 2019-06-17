import assert from "assert";
import { expect } from 'chai';
import { initData } from "/test/fixtures/fixtures";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams"
import { Projects } from "/imports/api/projects/projects"
import { createStubs, restoreStubs } from "/test/stubs"
if (Meteor.isServer) {

  describe("processDiagrams.create", function() {
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
      }
      try {
        ProcessDiagrams.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }      
      expect(errorCode, 'should throw not logged in').to.be.equal("not-authorized");
    });

    it("creates a new diagram", async function() {
      const context = {userId: Meteor.users.findOne()._id};
      let errorCode;

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        description: "description"
      }
      ProcessDiagrams.methods.create._execute(context, args);
      expect(ProcessDiagrams.find().count()).to.be.equal(1);
    });

  });

  describe("processDiagrams.clone", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("clone a a diagram should copy all data except name", async function() {
      const context = {userId: Meteor.users.findOne()._id};
      let errorCode;

      const args = {
        projectId: Projects.findOne()._id,
        name: "name",
        description: "description"
      }
      ProcessDiagrams.methods.create._execute(context, args);
      expect(ProcessDiagrams.find().count()).to.be.equal(1);

      ProcessDiagrams.methods.clone._execute(context, {processDiagramId: ProcessDiagrams.findOne()._id});
      expect(ProcessDiagrams.find().count()).to.be.equal(2);

      const diagrams = ProcessDiagrams.find().fetch();
      expect("Copie de " + diagrams[0].name).to.be.equal(diagrams[1].name);
      expect(diagrams[0].description).to.be.equal(diagrams[1].description);
      expect(diagrams[0].xml).to.be.equal(diagrams[1].xml);
      expect(diagrams[0].projectId).to.be.equal(diagrams[1].projectId);
    });

  });

}

