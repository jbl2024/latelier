import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import {
  checkLoggedIn,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

export const ProcessDiagrams = new Mongo.Collection("processDiagrams");
if (Meteor.isServer) {
  Meteor.startup(() => {
    ProcessDiagrams.rawCollection().createIndex({ projectId: 1 });
  });
}

ProcessDiagrams.methods = {};

ProcessDiagrams.methods.create = new ValidatedMethod({
  name: "processDiagrams.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ projectId, name, description }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const id = ProcessDiagrams.insert({
      projectId: projectId,
      name: name,
      description: description,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return id;
  }
});

ProcessDiagrams.methods.create = new ValidatedMethod({
  name: "processDiagrams.update",
  validate: new SimpleSchema({
    bpmnId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ bpmnId, name, description }) {
    checkLoggedIn();
    const bpmn = ProcessDiagrams.findOne({ _id: bpmnId });
    if (!bpmn) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(processDiagrams.projectId);

    ProcessDiagrams.update(
      {
        _id: bpmnId
      },
      {
        $set: {
          name: name,
          description: description
        }
      }
    );
  }
});

ProcessDiagrams.methods.remove = new ValidatedMethod({
  name: "processDiagrams.remove",
  validate: new SimpleSchema({
    bpmnId: { type: String }
  }).validator(),
  run({ bpmnId }) {
    checkLoggedIn();
    const bpmn = ProcessDiagrams.findOne({ _id: bpmnId });
    if (!bpmn) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(processDiagrams.projectId);

    ProcessDiagrams.remove({ _id: bpmnId });
  }
});
