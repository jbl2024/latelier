import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Features } from "/imports/api/features/features"

Features.methods = {};

Features.methods.enable = new ValidatedMethod({
  name: "features.enable",
  validate: new SimpleSchema({
    objectId: { type: String },
    name: { type: String }
  }).validator(),
  run({ objectId, name }) {
    Features.upsert({
      name: name,
      objectId: objectId
    }, {
      $set: {
        name: name,
        objectId: objectId,
        enabled: true
      }
    });
  }
});

Features.methods.disable = new ValidatedMethod({
  name: "features.disable",
  validate: new SimpleSchema({
    objectId: { type: String },
    name: { type: String }
  }).validator(),
  run({ objectId, name }) {
    Features.upsert({
      name: name,
      objectId: objectId
    }, {
      $set: {
        name: name,
        objectId: objectId,
        enabled: false
      }
    });
  }
});

Features.methods.isEnabled = new ValidatedMethod({
  name: "features.isEnabled",
  validate: new SimpleSchema({
    objectId: { type: String },
    name: { type: String }
  }).validator(),
  run({ objectId, name }) {
    const feature = Features.findOne({
      name: name,
      objectId: objectId
    });
    if (feature) {
      return feature.enabled;
    }
    return false;
  }
});

Features.methods.load = new ValidatedMethod({
  name: "features.load",
  validate: new SimpleSchema({
    objectId: { type: String },
  }).validator(),
  run({ objectId }) {
    const features = Features.find({objectId: objectId}).fetch();
    const data = [];
    features.map(feature => {
      if (feature.enabled) {
        data.push(feature.name)
      }
    })
    return data;
  }
});
