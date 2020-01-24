import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import ExampleSchema from "./schema";

import {
  checkAdmin
} from "/imports/api/permissions/permissions";

export const Examples = new Mongo.Collection("bpmnExamples");
Examples.attachSchema(ExampleSchema);
Examples.methods = {};

Examples.methods.create = new ValidatedMethod({
  name: "bpmnExamples.create",
  validate: new SimpleSchema({
    name: { type: String },
    description: { type: String, optional: true },
    xml: { type: String, optional: true }
  }).validator(),
  run({ name, description, xml }) {
    checkAdmin();

    const id = Examples.insert({
      name,
      description,
      xml,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return id;
  }
});

Examples.methods.update = new ValidatedMethod({
  name: "bpmnExamples.update",
  validate: new SimpleSchema({
    exampleId: { type: String },
    name: { type: String },
    description: { type: String, optional: true },
    xml: { type: String, optional: true }
  }).validator(),
  run({ exampleId, name, description, xml }) {
    checkAdmin();
    const example = Examples.findOne({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    Examples.update(
      {
        _id: exampleId
      },
      {
        $set: {
          name,
          description,
          xml
        }
      }
    );
  }
});

Examples.methods.saveXML = new ValidatedMethod({
  name: "bpmnExamples.saveXML",
  validate: new SimpleSchema({
    exampleId: { type: String },
    xml: { type: String }
  }).validator(),
  run({ exampleId, xml }) {
    checkAdmin();
    const example = Examples.findOne({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    Examples.update(
      {
        _id: exampleId
      },
      {
        $set: {
          xml
        }
      }
    );
  }
});

Examples.methods.remove = new ValidatedMethod({
  name: "bpmnExamples.remove",
  validate: new SimpleSchema({
    exampleId: { type: String }
  }).validator(),
  run({ exampleId }) {
    checkAdmin();
    const example = Examples.findOne({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    Examples.remove({ _id: exampleId });
  }
});

Examples.methods.clone = new ValidatedMethod({
  name: "bpmnExamples.clone",
  validate: new SimpleSchema({
    exampleId: { type: String }
  }).validator(),
  run({ exampleId }) {
    checkAdmin();
    const example = Examples.findOne({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    const id = Examples.insert({
      projectId: example.projectId,
      name: `Copie de ${example.name}`,
      description: example.description,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      xml: example.xml
    });
    return id;
  }
});
