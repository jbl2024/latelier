import assert from "assert";
import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { Labels } from "/imports/api/labels/labels";
import { ProjectStates } from "/imports/api/projects/projects";
import { Permissions } from "/imports/api/permissions/permissions"
import { createStubs, restoreStubs } from "/test/stubs"

if (Meteor.isServer) {
  
  describe("projects", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("clone project keep members", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};
      const projectA_id = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      })
      expect(projectA_id).to.not.be.null;
      const projectA = Projects.findOne(projectA_id);
      expect(projectA.members).to.be.an('array').that.include(userId);

      const projectB_id = Projects.methods.clone._execute(context, {
        projectId: projectA_id
      })
      expect(projectB_id).to.not.be.null;
      const projectB = Projects.findOne(projectB_id);
      expect(projectB.members).to.be.an('array').that.include(userId);
    });

    it("clone project keep features", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};
      const projectA_id = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      })
      expect(projectA_id).to.not.be.null;

      Projects.methods.addFeature._execute(context, {
        projectId: projectA_id,
        feature: "estimation"
      });
      const projectA = Projects.findOne(projectA_id);
      expect(projectA.features).to.be.an('array').that.include("estimation");

      const projectB_id = Projects.methods.clone._execute(context, {
        projectId: projectA_id
      })
      expect(projectB_id).to.not.be.null;
      const projectB = Projects.findOne(projectB_id);
      expect(projectB.features).to.be.an('array').that.include("estimation");
    });

    it("delete forever should remove associated objects", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};
      const projectIds = []
      const labelIds = []
      for (let i = 0; i < 10; i++) {
        const projectId = Projects.methods.create._execute(context, {
          name: "project",
          projectType: "kanban",
          state: ProjectStates.PRODUCTION
        });
        projectIds.push(projectId);
        const labelId = Labels.methods.create._execute(context, {
          projectId: projectId,
          name: "a label",
          color: "a color"
        });
        labelIds.push(labelId);
        expect(projectId).to.not.be.null;
      }

      expect(projectIds).to.have.lengthOf(10);
      expect(labelIds).to.have.lengthOf(10);

      const userData = {
        createdAt: new Date(),
        email: "foo@bar.com",
      };
      const otherUserId = Accounts.createUser(userData);
      Permissions.methods.setAdmin._execute(context, {userId: otherUserId, scope: projectIds[0]});
      Permissions.methods.setAdmin._execute(context, {userId: otherUserId, scope: projectIds[1]});
      Permissions.methods.setAdmin._execute(context, {userId: otherUserId, scope: projectIds[2]});

      Projects.methods.addToUserFavorites._execute(context, {
        projectId: projectIds[0],
        userId: Meteor.userId()
      });
      
      expect(Meteor.users.findOne({_id: Meteor.userId()}).profile.favoriteProjects).to.be.an('array').that.include(projectIds[0]);
      expect(Permissions.isAdmin(otherUserId, projectIds[0])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect(Labels.findOne({projectId: projectIds[0]})).not.to.be.undefined;

      Projects.methods.deleteForever._execute(context, {
        projectId: projectIds[0]
      });

      expect(Meteor.users.findOne({_id: Meteor.userId()}).profile.favoriteProjects).to.be.an('array').that.not.include(projectIds[0]);
      expect(Permissions.isAdmin(otherUserId, projectIds[0])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect(Labels.findOne({projectId: projectIds[0]})).to.be.undefined;

    });
  });
}