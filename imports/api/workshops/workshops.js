import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SessionSchema from "./schema";
import {
  checkLoggedIn,
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

export const Workshops = new Mongo.Collection("workshops_workshops");
Workshops.attachSchema(SessionSchema);
Workshops.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Workshops.rawCollection().createIndex({ projectId: 1 });
  });
}

Workshops.methods.create = new ValidatedMethod({
  name: "workshops.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ projectId, name, description }) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const id = Workshops.insert({
      projectId,
      name,
      description,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return id;
  }
});

Workshops.methods.update = new ValidatedMethod({
  name: "workshops.update",
  validate: new SimpleSchema({
    workshopId: { type: String },
    name: { type: String },
    description: { type: String, optional: true }
  }).validator(),
  run({ workshopId, name, description }) {
    checkLoggedIn();
    const workshop = Workshops.findOne({ _id: workshopId });
    if (!workshop) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(workshop.projectId);

    Workshops.update(
      {
        _id: workshopId
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

Workshops.methods.remove = new ValidatedMethod({
  name: "workshops.remove",
  validate: new SimpleSchema({
    workshopId: { type: String }
  }).validator(),
  run({ workshopId }) {
    checkLoggedIn();
    const workshop = Workshops.findOne({ _id: workshopId });
    if (!workshop) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(workshop.projectId);

    Workshops.remove({ _id: workshopId });
  }
});
