import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ProjectGroups } from "../projectGroups";

Meteor.methods({
  async "projectGroups.create"(organizationId, name) {
    check(organizationId, String);
    check(name, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const projectGroupId = await ProjectGroups.insertAsync({
      organizationId,
      name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return projectGroupId;
  },

  async "projectGroups.remove"(projectGroupId) {
    check(projectGroupId, String);

    await ProjectGroups.removeAsync(projectGroupId);
  },

  async "projectGroups.updateName"(projectGroupId, name) {
    check(projectGroupId, String);
    check(name, String);
    if (name.length === 0) {
      throw new Meteor.Error("invalid-name");
    }

    await ProjectGroups.updateAsync({ _id: projectGroupId }, { $set: { name } });
  },

  async "projectGroups.addProject"(projectGroupId, projectId) {
    check(projectGroupId, String);
    check(projectId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (
      await ProjectGroups.find({ _id: projectGroupId, projects: projectId }).countAsync()
      > 0
    ) {
      return;
    }
    await ProjectGroups.updateAsync(
      { _id: projectGroupId },
      { $push: { projects: projectId } }
    );
  },

  async "projectGroups.removeProject"(projectGroupId, projectId) {
    check(projectGroupId, String);
    check(projectId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (
      await ProjectGroups.find({
        _id: projectGroupId,
        projects: projectId
      }).countAsync() === 0
    ) {
      return;
    }
    await ProjectGroups.updateAsync(
      { _id: projectGroupId },
      { $pull: { projects: projectId } }
    );
  }
});
