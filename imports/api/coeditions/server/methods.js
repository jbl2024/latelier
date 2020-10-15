import { Meteor } from "meteor/meteor";
import { Schema } from "prosemirror-model";
import { Coeditions } from "/imports/api/coeditions/coeditions";
import { Step } from "prosemirror-transform";
import { checkCanWriteObject } from "/imports/api/permissions/permissions";

Coeditions.methods.send = new ValidatedMethod({
  name: "coeditions.init",
  validate: new SimpleSchema({
    objectId: { type: String },
    permissionObject: { type: String },
    permissionId: { type: String }
  }).validator(),
  run({ objectId, permissionObject, permissionId }) {
    checkCanWriteObject(permissionObject, permissionId);
    let storedData = Coeditions.findOne({
      objectId: objectId
    }, {
      sort: { version: -1 }
    });

    if (!storedData) {
      Coeditions.insert({
        createdAt: new Date(),
        objectId: objectId,
        version: 0,
        doc: JSON.stringify({
          type: "doc",
          content: [{
            type: "paragraph"
          }]
        })
      });
      storedData = Coeditions.findOne({
        objectId: objectId
      }, {
        sort: { version: -1 }
      });
    }
    return storedData;
  }
});

Coeditions.methods.send = new ValidatedMethod({
  name: "coeditions.send",
  validate: new SimpleSchema({
    objectId: { type: String },
    permissionObject: { type: String },
    permissionId: { type: String },
    sendable: { type: Object, blackbox: true },
    schema: { type: Object, blackbox: true }
  }).validator(),
  run({ objectId, permissionObject, permissionId, sendable, schema }) {
    const storedData = Meteor.call("coeditions.init", { objectId, permissionObject, permissionId });
    const { version, clientID, steps } = sendable;

    if (storedData.version !== version) {
      return storedData;
    }

    const proseSchema = new Schema(schema);

    let doc = proseSchema.nodeFromJSON(JSON.parse(storedData.doc));
    const newSteps = steps.map((step) => {
      const newStep = Step.fromJSON(proseSchema, step);
      newStep.clientID = clientID;
      const result = newStep.apply(doc);
      doc = result.doc;
      return newStep;
    });
    const newVersion = version + newSteps.length;

    const newObject = {
      createdAt: new Date(),
      objectId: objectId,
      version: newVersion,
      doc: JSON.stringify(doc),
      steps: JSON.stringify(newSteps.map((step, index) => {
        const stepData = {
          step: step,
          version: version + index + 1,
          clientID: step.clientID
        };
        return stepData;
      }))
    };
    Coeditions.insert(newObject);

    Meteor.call("coeditions.purge", { objectId });

    return newObject;
  }
});

Coeditions.methods.purge = new ValidatedMethod({
  name: "coeditions.purge",
  validate: new SimpleSchema({
    objectId: { type: String }
  }).validator(),
  run({ objectId }) {
    this.unblock();

    const count = Coeditions.find({ objectId }).count();
    const keep = Meteor.settings.coedition?.steps || 500;
    if (count > keep) {
      const coeditions = Coeditions.find(
        { objectId },
        { sort: { version: 1 } }
      ).fetch();
      const toDelete = count - keep;
      for (let i = 0; i < toDelete; i++) {
        Coeditions.remove({ _id: coeditions[i]._id });
      }
    }
  }
});

Coeditions.methods.removeOutdated = new ValidatedMethod({
  name: "coeditions.removeOutdated",
  validate: new SimpleSchema({
    when: { type: Date }
  }).validator(),
  run({ when }) {
    this.unblock();

    Coeditions.remove({
      createdAt: {
        $lte: when
      }
    });
  }
});
