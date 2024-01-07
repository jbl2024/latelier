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
  async run({ name, description, xml }) {
    await checkAdmin();

    const id = await Examples.insertAsync({
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
  async run({ exampleId, name, description, xml }) {
    await checkAdmin();
    const example = await Examples.findOneAsync({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    await Examples.updateAsync(
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
  async run({ exampleId, xml }) {
    await checkAdmin();
    const example = await Examples.findOneAsync({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    await Examples.updateAsync(
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
  async run({ exampleId }) {
    await checkAdmin();
    const example = await Examples.findOneAsync({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    await Examples.removeAsync({ _id: exampleId });
  }
});

Examples.methods.clone = new ValidatedMethod({
  name: "bpmnExamples.clone",
  validate: new SimpleSchema({
    exampleId: { type: String }
  }).validator(),
  async run({ exampleId }) {
    await checkAdmin();
    const example = await Examples.findOneAsync({ _id: exampleId });
    if (!example) {
      throw new Meteor.Error("not-found");
    }

    const id = await Examples.insertAsync({
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
