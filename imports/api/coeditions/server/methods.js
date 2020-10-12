import { Meteor } from "meteor/meteor";
import { Schema } from "prosemirror-model";
import { Coeditions } from "/imports/api/coeditions/coeditions";
import { Step } from "prosemirror-transform";

Coeditions.methods.send = new ValidatedMethod({
  name: "coeditions.init",
  validate: new SimpleSchema({
    objectId: { type: String }
  }).validator(),
  run({ objectId }) {
    let storedData = Coeditions.findOne({
      objectId: objectId
    }, {
      sort: { version: -1 }
    });

    if (!storedData) {
      Coeditions.insert({
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
        sort: { _id: 1 }
      });
    }
    return storedData;
  }
});

Coeditions.methods.send = new ValidatedMethod({
  name: "coeditions.send",
  validate: new SimpleSchema({
    objectId: { type: String },
    sendable: { type: Object, blackbox: true },
    schema: { type: Object, blackbox: true }
  }).validator(),
  run({ objectId, sendable, schema }) {
    const storedData = Coeditions.findOne({
      objectId: objectId
    }, {
      sort: { version: -1 }
    });

    if (!storedData) {
      throw Meteor.error("coedition-not-initialized");
    }

    const { version, clientID, steps } = sendable;

    if (storedData.version !== version) {
      return version;
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
    console.log(newObject)

    //  const newData = [
    // ...limitedOldData,
    // ...steps.map((step, index) => {
    //   return {
    //     step: JSON.parse(JSON.stringify(step)),
    //     version: version + index + 1,
    //     clientID: step.clientID,
    //   }
    // })
    Coeditions.insert(newObject);
    return newVersion;
  }
});
