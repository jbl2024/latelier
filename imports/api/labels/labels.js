import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Tasks } from "/imports/api/tasks/tasks";
import {
  checkLoggedIn,
  checkCanReadProject,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";
import LabelSchema from "./schema";

export const Labels = new Mongo.Collection("labels");
Labels.attachSchema(LabelSchema);
Labels.methods = {};

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await Tasks.rawCollection().createIndex({ projectId: 1 });
  });
}

Labels.methods.create = new ValidatedMethod({
  name: "labels.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    color: { type: String }
  }).validator(),
  async run({ projectId, name, color }) {
    checkLoggedIn();
    await checkCanWriteProject(projectId);

    const labelId = await Labels.insertAsync({
      projectId,
      name,
      color,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return labelId;
  }
});

Labels.methods.remove = new ValidatedMethod({
  name: "labels.remove",
  validate: new SimpleSchema({
    labelId: { type: String }
  }).validator(),
  async run({ labelId }) {
    checkLoggedIn();
    const label = Labels.findOne({ _id: labelId });
    if (!label) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(label.projectId);
    await Tasks.direct.updateAsync(
      { labels: labelId },
      { $pull: { labels: labelId } },
      { multi: true }
    );
    Labels.remove(labelId);
  }
});

Labels.methods.updateColor = new ValidatedMethod({
  name: "labels.updateColor",
  validate: new SimpleSchema({
    labelId: { type: String },
    color: { type: String }
  }).validator(),
  async run({ labelId, color }) {
    checkLoggedIn();
    const label = Labels.findOne({ _id: labelId });
    if (!label) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(label.projectId);
    await Labels.updateAsync({ _id: labelId }, { $set: { color } });
  }
});

Labels.methods.updateNameAndColor = new ValidatedMethod({
  name: "labels.updateNameAndColor",
  validate: new SimpleSchema({
    labelId: { type: String },
    name: { type: String },
    color: { type: String }
  }).validator(),
  async run({ labelId, name, color }) {
    checkLoggedIn();
    const label = await Labels.findOneAsync({ _id: labelId });
    if (!label) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(label.projectId);
    await Labels.updateAsync({ _id: labelId }, { $set: { color, name } });
  }
});

Labels.methods.import = new ValidatedMethod({
  name: "labels.import",
  validate: new SimpleSchema({
    from: { type: String },
    to: { type: String }
  }).validator(),
  async run({ from, to }) {
    checkLoggedIn();
    await checkCanReadProject(from);
    await checkCanWriteProject(to);

    const labels = Labels.find({ projectId: from }) || [];
    await labels.forEachAsync(async (label) => {
      if (!await Labels.findOneAsync({ projectId: to, name: label.name })) {
        await Meteor.callAsync("labels.create", {
          projectId: to,
          name: label.name,
          color: label.color
        });
      }
    });
  }
});
