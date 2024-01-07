import { expect } from "chai";
import { initData } from "/test/fixtures/fixtures";
import { Examples } from "/imports/api/bpmn/examples/examples";
import { Roles } from "meteor/jbl2024:roles";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("bpmnExamples.create", function() {
    beforeEach(async function() {
      await initData();
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
        await Examples.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });

    it("regular users are forbidden", async function() {
      const context = { userId: (await Meteor.users.findOneAsync())._id };
      let errorCode;

      const args = {
        name: "name",
        description: "description"
      };
      try {
        await Examples.methods.create._execute(context, args);
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not authorized").to.be.equal(
        "not-authorized"
      );
    });

    it("creates a new example", async function() {
      const userId = (await Meteor.users.findOneAsync())._id;
      await Roles.addUsersToRolesAsync(userId, "admin", Roles.GLOBAL_GROUP);
      const context = { userId: userId };

      const args = {
        name: "name",
        description: "description"
      };
      await Examples.methods.create._execute(context, args);
      expect(await Examples.find().countAsync()).to.be.equal(1);
    });
  });

  describe("bpmnExamples.clone", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("clone an example should copy all data except name", async function() {
      const userId = (await Meteor.users.findOneAsync())._id;
      await Roles.addUsersToRolesAsync(userId, "admin", Roles.GLOBAL_GROUP);
      const context = { userId: userId };

      const args = {
        name: "name",
        description: "description"
      };
      await Examples.methods.create._execute(context, args);
      expect(await Examples.find().countAsync()).to.be.equal(1);

      await Examples.methods.clone._execute(context, {
        exampleId: await Examples.findOne()._id
      });
      expect(await Examples.find().countAsync()).to.be.equal(2);

      const examples = await Examples.find().fetchAsync();
      expect(`Copie de ${examples[0].name}`).to.be.equal(examples[1].name);
      expect(examples[0].description).to.be.equal(examples[1].description);
      expect(examples[0].xml).to.be.equal(examples[1].xml);
    });
  });
}
