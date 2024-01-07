import SimpleSchema from "simpl-schema";
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
  async run({ objectId, permissionObject, permissionId }) {
    await checkCanWriteObject(permissionObject, permissionId);
    let storedData = await Coeditions.findOneAsync({
      objectId: objectId
    }, {
      sort: { version: -1 }
    });

    if (!storedData) {
      await Coeditions.insertAsync({
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
      storedData = await Coeditions.findOneAsync({
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
  async run({ objectId, permissionObject, permissionId, sendable, schema }) {
    const storedData = await Meteor.callAsync("coeditions.init", { objectId, permissionObject, permissionId });
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
    await Coeditions.insertAsync(newObject);

    await Meteor.callAsync("coeditions.purge", { objectId });

    return newObject;
  }
});

Coeditions.methods.purge = new ValidatedMethod({
  name: "coeditions.purge",
  validate: new SimpleSchema({
    objectId: { type: String }
  }).validator(),
  async run({ objectId }) {
    this.unblock();

    const count = await Coeditions.find({ objectId }).countAsync();
    const keep = Meteor.settings.coedition?.steps || 500;
    if (count > keep) {
      const coeditions = await Coeditions.find(
        { objectId },
        { sort: { version: 1 } }
      ).fetchAsync();
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
  async run({ when }) {
    this.unblock();

    await Coeditions.removeAsync({
      createdAt: {
        $lte: when
      }
    });
  }
});
