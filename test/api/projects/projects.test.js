import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Projects, ProjectStates } from "/imports/api/projects/projects";
import { Labels } from "/imports/api/labels/labels";
import { Lists } from "/imports/api/lists/lists";
import { Tasks } from "/imports/api/tasks/tasks";

import { Permissions } from "/imports/api/permissions/permissions";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("projects", function () {
    beforeEach(function () {
      initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("clone project keep members", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;
      const projectA = Projects.findOne(projectAid);
      expect(projectA.members).to.be.an("array").that.include(userId);

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      const projectB = Projects.findOne(projectBid);
      expect(projectB.members).to.be.an("array").that.include(userId);
    });

    it("clone project keep admins", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;
      Permissions.setAdmin(userId, projectAid);

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      expect(Permissions.isAdmin(userId, projectAid)).to.be.true;
      expect(Permissions.isAdmin(userId, projectBid)).to.be.true;
    });

    it("clone project give admins rights", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      expect(Permissions.isAdmin(userId, projectAid)).to.be.true;
      expect(Permissions.isAdmin(userId, projectBid)).to.be.true;
    });

    it("clone project keep features", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      Projects.methods.addFeature._execute(context, {
        projectId: projectAid,
        feature: "estimation"
      });
      const projectA = Projects.findOne(projectAid);
      expect(projectA.features).to.be.an("array").that.include("estimation");

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      const projectB = Projects.findOne(projectBid);
      expect(projectB.features).to.be.an("array").that.include("estimation");
    });

    it("clone project keep tasks in corresponding lists", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = Lists.findOne({
        projectId: projectAid,
        name: "A planifier"
      })._id;

      const listId2 = Lists.findOne({
        projectId: projectAid,
        name: "En cours"
      })._id;

      Meteor.call("tasks.insert", projectAid, listId1, "task1");

      Meteor.call("tasks.insert", projectAid, listId2, "task2");

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;

      const task1 = Tasks.findOne({
        projectId: projectBid,
        listId: Lists.findOne({
          projectId: projectBid,
          name: "A planifier"
        })._id
      });
      expect(task1).to.not.be.undefined;
      expect(task1._id).to.not.be.null;

      const task2 = Tasks.findOne({
        projectId: projectBid,
        listId: Lists.findOne({
          projectId: projectBid,
          name: "En cours"
        })._id
      });
      expect(task2).to.not.be.undefined;
      expect(task2._id).to.not.be.null;
    });

    it("clone task to another project has consistent list", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = Lists.findOne({
        projectId: projectAid,
        name: "A planifier"
      })._id;

      const listId2 = Lists.findOne({
        projectId: projectAid,
        name: "En cours"
      })._id;

      const task1id = Meteor.call("tasks.insert", projectAid, listId1, "task1")
        ._id;

      const task2id = Meteor.call("tasks.insert", projectAid, listId2, "task2")
        ._id;

      const projectBid = Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectBid).to.not.be.null;

      Meteor.call("tasks.clone", task1id, "task1", projectBid);

      Meteor.call("tasks.clone", task2id, "task2", projectBid);

      const task1 = Tasks.findOne({
        projectId: projectBid
      });
      expect(task1).to.not.be.undefined;
      expect(task1._id).to.not.be.null;

      const task2 = Tasks.findOne({
        projectId: projectBid
      });
      expect(task2).to.not.be.undefined;
      expect(task2._id).to.not.be.null;

      expect(Lists.findOne(task1.listId).projectId).to.be.equal(projectBid);
      expect(Lists.findOne(task2.listId).projectId).to.be.equal(projectBid);
    });

    it("clone project keeps labels on tasks", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectAid = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = Lists.findOne({
        projectId: projectAid,
        name: "A planifier"
      })._id;

      const listId2 = Lists.findOne({
        projectId: projectAid,
        name: "En cours"
      })._id;

      const task1id = Meteor.call("tasks.insert", projectAid, listId1, "task1")
        ._id;

      Meteor.call("tasks.insert", projectAid, listId2, "task2")._id;

      const labelId = Meteor.call("labels.create", {
        projectId: projectAid,
        name: "label",
        color: "black"
      });
      Meteor.call("tasks.addLabel", task1id, labelId);

      const projectBid = Projects.methods.clone._execute(context, {
        projectId: projectAid
      });

      const labels = Labels.find().fetch();
      expect(labels).to.have.lengthOf(2);

      const label = Labels.findOne({
        projectId: projectBid
      });

      expect(label).to.not.be.undefined;
      expect(label._id).to.not.be.null;

      const clonedTaskWithLabel = Tasks.findOne({
        name: "task1",
        projectId: projectBid
      });

      expect(clonedTaskWithLabel).to.not.be.undefined;
      expect(clonedTaskWithLabel.labels).to.not.be.undefined;
      expect(clonedTaskWithLabel.labels).to.have.lengthOf(1);
    });

    it("delete forever should remove associated objects", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectIds = [];
      const labelIds = [];
      for (let i = 0; i < 10; i++) {
        const projectId = Projects.methods.create._execute(context, {
          name: "project",
          projectType: "kanban",
          state: ProjectStates.PRODUCTION
        });
        projectIds.push(projectId);
        const labelId = Labels.methods.create._execute(context, {
          projectId,
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
        email: "foo@bar.com"
      };
      const otherUserId = Accounts.createUser(userData);
      Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[0]
      });
      Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[1]
      });
      Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[2]
      });

      Projects.methods.addToUserFavorites._execute(context, {
        projectId: projectIds[0],
        userId: Meteor.userId()
      });

      Projects.methods.addToUserDigests._execute(context, {
        projectId: projectIds[0],
        userId: Meteor.userId()
      });

      expect(
        Meteor.users.findOne({ _id: Meteor.userId() }).profile.favoriteProjects
      )
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(Meteor.users.findOne({ _id: Meteor.userId() }).profile.digests)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(Permissions.isAdmin(otherUserId, projectIds[0])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect(Labels.findOne({ projectId: projectIds[0] })).not.to.be.undefined;

      Projects.methods.deleteForever._execute(context, {
        projectId: projectIds[0]
      });

      expect(
        Meteor.users.findOne({ _id: Meteor.userId() }).profile.favoriteProjects
      )
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(Meteor.users.findOne({ _id: Meteor.userId() }).profile.digests)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(Permissions.isAdmin(otherUserId, projectIds[0])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect(Labels.findOne({ projectId: projectIds[0] })).to.be.undefined;
    });

    it("leave project should remove associated objects", async function () {
      const user = Meteor.users.findOne();
      const userId = user._id;

      const context = { userId };
      const projectIds = [];
      for (let i = 0; i < 10; i++) {
        const projectId = Projects.methods.create._execute(context, {
          name: "project",
          projectType: "kanban",
          state: ProjectStates.PRODUCTION
        });
        projectIds.push(projectId);
      }

      expect(projectIds).to.have.lengthOf(10);

      Permissions.methods.setAdmin._execute(context, {
        userId: userId,
        scope: projectIds[0]
      });

      Projects.methods.addToUserFavorites._execute(context, {
        projectId: projectIds[0],
        userId: userId
      });

      Projects.methods.addToUserDigests._execute(context, {
        projectId: projectIds[0],
        userId: userId
      });

      expect(Meteor.users.findOne({ _id: userId }).profile.favoriteProjects)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(Meteor.users.findOne({ _id: userId }).profile.digests)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(Permissions.isAdmin(user._id, projectIds[0])).to.be.true;

      Projects.methods.leave._execute(context, {
        projectId: projectIds[0]
      });

      expect(Meteor.users.findOne({ _id: userId }).profile.favoriteProjects)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(Meteor.users.findOne({ _id: userId }).profile.digests)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(Permissions.isAdmin(user, projectIds[0])).to.be.false;
    });

    it("getHistory is available for members", async function () {
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectId = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectId).to.not.be.null;

      const history = Meteor.call("projects.getHistory", {
        projectId: projectId,
        page: 1
      });
      expect(history).to.not.be.null;
    });

    it("getHistory is not available for anonymous users", async function () {
      let errorCode;
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectId = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectId).to.not.be.null;

      restoreStubs();

      try {
        Meteor.call("projects.getHistory", {
          projectId: projectId,
          page: 1
        });
      } catch (error) {
        errorCode = error.error;
      }
      expect(errorCode, "should throw not logged in").to.be.equal(
        "not-authorized"
      );
    });

    it("getHistory is available only for project members", async function () {
      let errorCode;
      const userId = Meteor.users.findOne()._id;
      const context = { userId };
      const projectId = Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectId).to.not.be.null;

      const anotherUserId = Meteor.users.findOne({
        _id: { $ne: userId }
      });

      restoreStubs();
      createStubs(anotherUserId);

      try {
        Meteor.call("projects.getHistory", {
          projectId: projectId,
          page: 1
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
