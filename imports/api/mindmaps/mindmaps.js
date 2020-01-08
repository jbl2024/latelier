import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import MindmapSchema from "./schema";

import {
  checkLoggedIn,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

export const Mindmaps = new Mongo.Collection("mindmaps");
Mindmaps.attachSchema(MindmapSchema);
Mindmaps.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Mindmaps.rawCollection().createIndex({ projectId: 1 });
  });
}

Mindmaps.methods.create = new ValidatedMethod({
  name: "mindmaps.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ projectId, name, description }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const id = Mindmaps.insert({
      projectId,
      name,
      description,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return id;
  }
});

Mindmaps.methods.update = new ValidatedMethod({
  name: "mindmaps.update",
  validate: new SimpleSchema({
    mindmapId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ mindmapId, name, description }) {
    checkLoggedIn();
    const mindmap = Mindmaps.findOne({ _id: mindmapId });
    if (!mindmap) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(mindmap.projectId);

    Mindmaps.update(
      {
        _id: mindmapId
      },
      {
        $set: {
          name,
          description
        }
      }
    );
  }
});

Mindmaps.methods.saveData = new ValidatedMethod({
  name: "mindmaps.saveData",
  validate: new SimpleSchema({
    mindmapId: { type: String },
    data: { type: String }
  }).validator(),
  run({ mindmapId, data }) {
    checkLoggedIn();
    const mindmap = Mindmaps.findOne({ _id: mindmapId });
    if (!mindmap) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(mindmap.projectId);

    Mindmaps.update(
      {
        _id: mindmapId
      },
      {
        $set: {
          data
        }
      }
    );
  }
});

Mindmaps.methods.remove = new ValidatedMethod({
  name: "mindmaps.remove",
  validate: new SimpleSchema({
    mindmapId: { type: String }
  }).validator(),
  run({ mindmapId }) {
    checkLoggedIn();
    const mindmap = Mindmaps.findOne({ _id: mindmapId });
    if (!mindmap) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(mindmap.projectId);

    Mindmaps.remove({ _id: mindmapId });
  }
});

Mindmaps.methods.clone = new ValidatedMethod({
  name: "mindmaps.clone",
  validate: new SimpleSchema({
    mindmapId: { type: String }
  }).validator(),
  run({ mindmapId }) {
    checkLoggedIn();
    const mindmap = Mindmaps.findOne({ _id: mindmapId });
    if (!mindmap) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(mindmap.projectId);

    const id = Mindmaps.insert({
      projectId: mindmap.projectId,
      name: `Copie de ${mindmap.name}`,
      description: mindmap.description,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      data: mindmap.data
    });
    return id;
  }
});
