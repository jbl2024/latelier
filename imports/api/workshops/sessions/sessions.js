import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SessionSchema from "./schema";
import {
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

import { Workshops } from "../workshops";

export const Sessions = new Mongo.Collection("workshops_sessions");
Sessions.attachSchema(SessionSchema);
Sessions.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Sessions.rawCollection().createIndex({ workshopId: 1 });
  });
}

Sessions.methods.create = new ValidatedMethod({
  name: "workshops.sessions.create",
  validate: new SimpleSchema({
    workshopId: { type: String },
    name: { type: String }
  }).validator(),
  run({ workshopId, name }) {
    const workshop = Workshops.findOne({ _id: workshopId });
    if (!workshop) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(workshop.projectId);

    const id = Sessions.insert({
      workshopId,
      name,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return id;
  }
});

Sessions.methods.update = new ValidatedMethod({
  name: "workshops.sessions.update",
  validate: new SimpleSchema({
    sessionId: { type: String },
    name: { type: String }
  }).validator(),
  run({ sessionId, name }) {
    const session = Sessions.findOne({ _id: sessionId });
    if (!session) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(session.projectId);

    Sessions.update(
      {
        _id: sessionId
      },
      {
        $set: {
          name
        }
      }
    );
  }
});

Sessions.methods.remove = new ValidatedMethod({
  name: "workshops.sessions.remove",
  validate: new SimpleSchema({
    sessionId: { type: String }
  }).validator(),
  run({ sessionId }) {
    const session = Sessions.findOne({ _id: sessionId });
    if (!session) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(session.projectId);

    Sessions.remove({ _id: sessionId });
  }
});
