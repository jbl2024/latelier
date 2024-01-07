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
    beforeEach(async function () {
      await initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("clone project keep members", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;
      const projectA = await Projects.findOneAsync(projectAid);
      expect(projectA.members).to.be.an("array").that.include(userId);

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      const projectB = await Projects.findOneAsync(projectBid);
      expect(projectB.members).to.be.an("array").that.include(userId);
    });

    it("clone project keep admins", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;
      Permissions.setAdmin(userId, projectAid);

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      expect(await Permissions.isAdmin(userId, projectAid)).to.be.true;
      expect(await Permissions.isAdmin(userId, projectBid)).to.be.true;
    });

    it("clone project give admins rights", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      expect(await Permissions.isAdmin(userId, projectAid)).to.be.true;
      expect(await Permissions.isAdmin(userId, projectBid)).to.be.true;
    });

    it("clone project keep features", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      await Projects.methods.addFeature._execute(context, {
        projectId: projectAid,
        feature: "estimation"
      });
      const projectA = await Projects.findOneAsync(projectAid);
      expect(projectA.features).to.be.an("array").that.include("estimation");

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;
      const projectB = await Projects.findOneAsync(projectBid);
      expect(projectB.features).to.be.an("array").that.include("estimation");
    });

    it("clone project keep tasks in corresponding lists", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Todo"
      }))._id;

      const listId2 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Doing"
      }))._id;

      await Meteor.callAsync("tasks.insert", projectAid, listId1, "task1");

      await Meteor.callAsync("tasks.insert", projectAid, listId2, "task2");

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });
      expect(projectBid).to.not.be.null;

      const task1 = await Tasks.findOneAsync({
        projectId: projectBid,
        listId: (await Lists.findOneAsync({
          projectId: projectBid,
          name: "Todo"
        }))._id
      });
      expect(task1).to.not.be.undefined;
      expect(task1._id).to.not.be.null;

      const task2 = await Tasks.findOneAsync({
        projectId: projectBid,
        listId: (await Lists.findOneAsync({
          projectId: projectBid,
          name: "Doing"
        }))._id
      });
      expect(task2).to.not.be.undefined;
      expect(task2._id).to.not.be.null;
    });

    it("clone task to another project has consistent list", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Todo"
      }))._id;

      const listId2 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Doing"
      }))._id;

      const task1id = (await Meteor.callAsync("tasks.insert", projectAid, listId1, "task1"))
        ._id;

      const task2id = (await Meteor.callAsync("tasks.insert", projectAid, listId2, "task2"))
        ._id;

      const projectBid = await Projects.methods.create._execute(context, {
        name: "projectB",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectBid).to.not.be.null;

      await Meteor.callAsync("tasks.clone", task1id, "task1", projectBid);

      await Meteor.callAsync("tasks.clone", task2id, "task2", projectBid);

      const task1 = await Tasks.findOneAsync({
        projectId: projectBid
      });
      expect(task1).to.not.be.undefined;
      expect(task1._id).to.not.be.null;

      const task2 = await Tasks.findOneAsync({
        projectId: projectBid
      });
      expect(task2).to.not.be.undefined;
      expect(task2._id).to.not.be.null;

      expect((await Lists.findOne(task1.listId).projectId)).to.be.equal(projectBid);
      expect((await Lists.findOne(task2.listId).projectId)).to.be.equal(projectBid);
    });

    it("clone project keeps labels on tasks", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectAid = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectAid).to.not.be.null;

      const listId1 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Todo"
      }))._id;

      const listId2 = (await Lists.findOneAsync({
        projectId: projectAid,
        name: "Doing"
      }))._id;

      const task1id = (await Meteor.callAsync("tasks.insert", projectAid, listId1, "task1"))
        ._id;

      await Meteor.callAsync("tasks.insert", projectAid, listId2, "task2");

      const labelId = await Meteor.callAsync("labels.create", {
        projectId: projectAid,
        name: "label",
        color: "black"
      });
      await Meteor.callAsync("tasks.addLabel", task1id, labelId);

      const projectBid = await Projects.methods.clone._execute(context, {
        projectId: projectAid
      });

      const labels = await Labels.find().fetchAsync();
      expect(labels).to.have.lengthOf(2);

      const label = await Labels.findOneAsync({
        projectId: projectBid
      });

      expect(label).to.not.be.undefined;
      expect(label._id).to.not.be.null;

      const clonedTaskWithLabel = await Tasks.findOneAsync({
        name: "task1",
        projectId: projectBid
      });

      expect(clonedTaskWithLabel).to.not.be.undefined;
      expect(clonedTaskWithLabel.labels).to.not.be.undefined;
      expect(clonedTaskWithLabel.labels).to.have.lengthOf(1);
    });

    it("delete forever should remove associated objects", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectIds = [];
      const labelIds = [];
      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        const projectId = await Projects.methods.create._execute(context, {
          name: "project",
          projectType: "kanban",
          state: ProjectStates.PRODUCTION
        });
        projectIds.push(projectId);
        // eslint-disable-next-line no-await-in-loop
        const labelId = await Labels.methods.create._execute(context, {
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
      await Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[0]
      });
      await Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[1]
      });
      await Permissions.methods.setAdmin._execute(context, {
        userId: otherUserId,
        scope: projectIds[2]
      });

      await Projects.methods.addToUserFavorites._execute(context, {
        projectId: projectIds[0],
        userId: Meteor.userId()
      });

      await Projects.methods.addToUserDigests._execute(context, {
        projectId: projectIds[0],
        userId: Meteor.userId()
      });

      expect(
        (await Meteor.users.findOneAsync({ _id: Meteor.userId() })).profile.favoriteProjects
      )
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect((await Meteor.users.findOneAsync({ _id: Meteor.userId() })).profile.digests)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(await Permissions.isAdmin(otherUserId, projectIds[0])).to.be.true;
      expect(await Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(await Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(await Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(await Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect((await Labels.findOneAsync({ projectId: projectIds[0] }))).not.to.be.undefined;

      await Projects.methods.deleteForever._execute(context, {
        projectId: projectIds[0]
      });

      expect(
        (await Meteor.users.findOneAsync({ _id: Meteor.userId() })).profile.favoriteProjects
      )
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect((await Meteor.users.findOne({ _id: Meteor.userId() })).profile.digests)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(await Permissions.isAdmin(otherUserId, projectIds[0])).to.be.false;
      expect(await Permissions.isAdmin(otherUserId, projectIds[1])).to.be.true;
      expect(await Permissions.isAdmin(otherUserId, projectIds[2])).to.be.true;
      expect(await Permissions.isAdmin(otherUserId, projectIds[3])).to.be.false;
      expect(await Permissions.isAdmin(otherUserId, projectIds[4])).to.be.false;

      expect((await Labels.findOneAsync({ projectId: projectIds[0] }))).to.be.undefined;
    });

    it("leave project should remove associated objects", async function () {
      const user = await Meteor.users.findOneAsync();
      const userId = user._id;

      const context = { userId };
      const projectIds = [];
      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        const projectId = await Projects.methods.create._execute(context, {
          name: "project",
          projectType: "kanban",
          state: ProjectStates.PRODUCTION
        });
        projectIds.push(projectId);
      }

      expect(projectIds).to.have.lengthOf(10);

      await Permissions.methods.setAdmin._execute(context, {
        userId: userId,
        scope: projectIds[0]
      });

      await Projects.methods.addToUserFavorites._execute(context, {
        projectId: projectIds[0],
        userId: userId
      });

      await Projects.methods.addToUserDigests._execute(context, {
        projectId: projectIds[0],
        userId: userId
      });

      expect((await Meteor.users.findOneAsync({ _id: userId })).profile.favoriteProjects)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect((await Meteor.users.findOneAsync({ _id: userId })).profile.digests)
        .to.be.an("array")
        .that.include(projectIds[0]);
      expect(await Permissions.isAdmin(user._id, projectIds[0])).to.be.true;

      await Projects.methods.leave._execute(context, {
        projectId: projectIds[0]
      });

      expect((await Meteor.users.findOneAsync({ _id: userId })).profile.favoriteProjects)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect((await Meteor.users.findOneAsync({ _id: userId })).profile.digests)
        .to.be.an("array")
        .that.not.include(projectIds[0]);
      expect(await Permissions.isAdmin(user, projectIds[0])).to.be.false;
    });

    it("getHistory is available for members", async function () {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectId = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectId).to.not.be.null;

      const history = await Meteor.callAsync("projects.getHistory", {
        projectId: projectId,
        page: 1
      });
      expect(history).to.not.be.null;
    });

    it("getHistory is not available for anonymous users", async function () {
      let errorCode;
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectId = await Projects.methods.create._execute(context, {
        name: "projectA",
        projectType: "kanban",
        state: ProjectStates.PRODUCTION
      });
      expect(projectId).to.not.be.null;

      restoreStubs();

      try {
        await Meteor.callAsync("projects.getHistory", {
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
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };
      const projectId = await Projects.methods.create._execute(context, {
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
        await Meteor.callAsync("projects.getHistory", {
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
