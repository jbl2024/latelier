import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import ProcessDiagramSchema from "./schema";

import {
  Permissions,
  checkCanWriteProject,
  checkLoggedIn
} from "/imports/api/permissions/permissions";

export const ProcessDiagrams = new Mongo.Collection("processDiagrams");
ProcessDiagrams.attachSchema(ProcessDiagramSchema);
ProcessDiagrams.methods = {};

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await ProcessDiagrams.rawCollection().createIndex({ projectId: 1 });
  });
}

ProcessDiagrams.methods.create = new ValidatedMethod({
  name: "processDiagrams.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: { type: String, optional: true },
    xml: { type: String, optional: true },
    diagramUserId: { type: String, optional: true }
  }).validator(),
  async run({ projectId, name, description, xml, diagramUserId }) {
    checkLoggedIn();
    await checkCanWriteProject(projectId);

    let userId = Meteor.userId();
    const canSelectUserId = diagramUserId && Meteor.isServer && Permissions.isAdmin(userId);
    userId = canSelectUserId ? diagramUserId : userId;

    const id = await ProcessDiagrams.insertAsync({
      projectId,
      name,
      description,
      xml,
      createdAt: new Date(),
      createdBy: userId
    });
    return id;
  }
});

ProcessDiagrams.methods.update = new ValidatedMethod({
  name: "processDiagrams.update",
  validate: new SimpleSchema({
    processDiagramId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  async run({ processDiagramId, name, description }) {
    checkLoggedIn();
    const processDiagram = ProcessDiagrams.findOne({ _id: processDiagramId });
    if (!processDiagram) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(processDiagram.projectId);

    await ProcessDiagrams.updateAsync(
      {
        _id: processDiagramId
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

ProcessDiagrams.methods.saveXML = new ValidatedMethod({
  name: "processDiagrams.saveXML",
  validate: new SimpleSchema({
    processDiagramId: { type: String },
    xml: { type: String }
  }).validator(),
  async run({ processDiagramId, xml }) {
    checkLoggedIn();
    const processDiagram = await ProcessDiagrams.findOneAsync({ _id: processDiagramId });
    if (!processDiagram) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(processDiagram.projectId);

    ProcessDiagrams.updateAsync(
      {
        _id: processDiagramId
      },
      {
        $set: {
          xml
        }
      }
    );
  }
});

ProcessDiagrams.methods.remove = new ValidatedMethod({
  name: "processDiagrams.remove",
  validate: new SimpleSchema({
    processDiagramId: { type: String }
  }).validator(),
  async run({ processDiagramId }) {
    checkLoggedIn();
    const processDiagram = await ProcessDiagrams.findOneAsync({ _id: processDiagramId });
    if (!processDiagram) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(processDiagram.projectId);

    await ProcessDiagrams.removeAsync({ _id: processDiagramId });
  }
});

ProcessDiagrams.methods.clone = new ValidatedMethod({
  name: "processDiagrams.clone",
  validate: new SimpleSchema({
    processDiagramId: { type: String }
  }).validator(),
  async run({ processDiagramId }) {
    checkLoggedIn();
    const processDiagram = await ProcessDiagrams.findOneAsync({ _id: processDiagramId });
    if (!processDiagram) {
      throw new Meteor.Error("not-found");
    }
    await checkCanWriteProject(processDiagram.projectId);

    const id = await ProcessDiagrams.insertAsync({
      projectId: processDiagram.projectId,
      name: `Copie de ${processDiagram.name}`,
      description: processDiagram.description,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      xml: processDiagram.xml
    });
    return id;
  }
});
