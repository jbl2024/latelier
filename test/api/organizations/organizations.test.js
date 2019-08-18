import assert from "assert";
import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { Organizations } from "/imports/api/organizations/organizations";
import { ProjectStates, ProjectAccessRights } from "/imports/api/projects/projects";
import { createStubs, restoreStubs } from "/test/stubs"

if (Meteor.isServer) {
  
  describe("organizations", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("organization creator is added as member", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};

      const organizationId = Organizations.methods.create._execute(context, {
        name: "organization"
      });
      const organization = Organizations.findOne(organizationId);
      expect(organization.members).to.be.an('array').that.include(userId);
    });

    it("organization members are added to project", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};

      const organizationId = Organizations.methods.create._execute(context, {
        name: "organization"
      });

      const userData = {
        createdAt: new Date(),
        email: "foo@bar.com",
      };
      const otherUserId = Accounts.createUser(userData);


      Organizations.methods.addMember._execute(context, {
        organizationId: organizationId,
        userId: otherUserId
      });

      const projectA_id = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        organizationId: organizationId,
        accessRights: ProjectAccessRights.ORGANIZATION,
        state: ProjectStates.PRODUCTION
      })

      const projectB_id = Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        organizationId: organizationId,
        accessRights: ProjectAccessRights.PRIVATE,
        state: ProjectStates.PRODUCTION
      })

      expect(projectA_id).to.not.be.null;
      expect(projectB_id).to.not.be.null;

      let projectA = Projects.findOne(projectA_id);
      expect(projectA.members).to.be.an('array').that.include(userId);
      expect(projectA.members).to.be.an('array').that.include(otherUserId);

      let projectB = Projects.findOne(projectB_id);
      expect(projectB.members).to.be.an('array').that.include(userId);
      expect(projectB.members).to.be.an('array').that.not.include(otherUserId);

      const user3 = {
        createdAt: new Date(),
        email: "foo+3@bar.com",
      };
      const user3Id = Accounts.createUser(user3);
      Organizations.methods.addMember._execute(context, {
        organizationId: organizationId,
        userId: user3Id
      });

      projectA = Projects.findOne(projectA_id);
      expect(projectA.members).to.be.an('array').that.include(user3Id);

      projectB = Projects.findOne(projectB_id);
      expect(projectB.members).to.be.an('array').that.not.include(user3Id);

      Organizations.methods.removeMember._execute(context, {
        organizationId: organizationId,
        userId: user3Id
      });

      projectA = Projects.findOne(projectA_id);
      expect(projectA.members).to.be.an('array').that.not.include(user3Id);

      projectB = Projects.findOne(projectB_id);
      expect(projectB.members).to.be.an('array').that.not.include(user3Id);


    });

  });
}