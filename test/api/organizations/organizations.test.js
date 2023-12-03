import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import {
  Projects,
  ProjectStates,
  ProjectAccessRights
} from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";

import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("organizations", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("organization creator is added as member", async function() {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };

      const organizationId = await Organizations.methods.create._execute(context, {
        name: "organization"
      });
      const organization = Organizations.findOne(organizationId);
      expect(organization.members)
        .to.be.an("array")
        .that.include(userId);
    });

    it("organization members are added to project", async function() {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };

      const organizationId = await Organizations.methods.create._execute(context, {
        name: "organization"
      });

      const userData = {
        createdAt: new Date(),
        email: "foo@bar.com"
      };
      const otherUserId = Accounts.createUser(userData);

      await Organizations.methods.addMember._execute(context, {
        organizationId,
        userId: otherUserId
      });

      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        organizationId,
        accessRights: ProjectAccessRights.ORGANIZATION,
        state: ProjectStates.PRODUCTION
      });

      const projectBid = await Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        organizationId,
        accessRights: ProjectAccessRights.PRIVATE,
        state: ProjectStates.PRODUCTION
      });

      expect(projectAid).to.not.be.null;
      expect(projectBid).to.not.be.null;

      let projectA = await await Projects.findOneAsyncAsync(projectAid);
      expect(projectA.members)
        .to.be.an("array")
        .that.include(userId);
      expect(projectA.members)
        .to.be.an("array")
        .that.include(otherUserId);

      let projectB = await await Projects.findOneAsyncAsync(projectBid);
      expect(projectB.members)
        .to.be.an("array")
        .that.include(userId);
      expect(projectB.members)
        .to.be.an("array")
        .that.not.include(otherUserId);

      const user3 = {
        createdAt: new Date(),
        email: "foo+3@bar.com"
      };
      const user3Id = Accounts.createUser(user3);
      await Organizations.methods.addMember._execute(context, {
        organizationId,
        userId: user3Id
      });

      projectA = await Projects.findOneAsync(projectAid);
      expect(projectA.members)
        .to.be.an("array")
        .that.include(user3Id);

      projectB = await Projects.findOneAsync(projectBid);
      expect(projectB.members)
        .to.be.an("array")
        .that.not.include(user3Id);

      await Organizations.methods.removeMember._execute(context, {
        organizationId,
        userId: user3Id
      });

      projectA = await Projects.findOneAsync(projectAid);
      expect(projectA.members)
        .to.be.an("array")
        .that.not.include(user3Id);

      projectB = await Projects.findOneAsync(projectBid);
      expect(projectB.members)
        .to.be.an("array")
        .that.not.include(user3Id);
    });
  });
}
