import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Examples } from "/imports/api/bpmn/examples/examples";
import { Roles } from "meteor/alanning:roles";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("bpmnExamples.create", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("anonymous users are forbidden", async function() {
      const context = {};
      let errorCode;

      const args = {
        name: "name",
        description: "description"
      };
      try {
        Examples.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });

    it("regular users are forbidden", async function() {
      const context = { userId: Meteor.users.findOne()._id };
      let errorCode;

      const args = {
        name: "name",
        description: "description"
      };
      try {
        Examples.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });

    it("creates a new example", async function() {
      Roles.addUsersToRoles(Meteor.users.findOne()._id, "admin", Roles.GLOBAL_GROUP);
      const context = { userId: Meteor.users.findOne()._id };

      const args = {
        name: "name",
        description: "description"
      };
      Examples.methods.create._execute(context, args);
      expect(Examples.find().count()).to.be.equal(1);
    });
  });

  describe("bpmnExamples.clone", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("clone an example should copy all data except name", async function() {
      Roles.addUsersToRoles(Meteor.users.findOne()._id, "admin", Roles.GLOBAL_GROUP);
      const context = { userId: Meteor.users.findOne()._id };

      const args = {
        name: "name",
        description: "description"
      };
      Examples.methods.create._execute(context, args);
      expect(Examples.find().count()).to.be.equal(1);

      Examples.methods.clone._execute(context, {
        exampleId: Examples.findOne()._id
      });
      expect(Examples.find().count()).to.be.equal(2);

      const examples = Examples.find().fetch();
      expect(`Copie de ${examples[0].name}`).to.be.equal(examples[1].name);
      expect(examples[0].description).to.be.equal(examples[1].description);
      expect(examples[0].xml).to.be.equal(examples[1].xml);
    });
  });
}
