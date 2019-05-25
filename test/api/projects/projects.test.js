import assert from "assert";
import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Projects } from "/imports/api/projects/projects";
import { ProjectStates } from "/imports/api/projects/projects";
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
  });
}