import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SessionSchema from "./schema";
import { checkCanWriteProject } from "/imports/api/permissions/permissions";

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

    const _findLastOrder = function() {
      const session = Sessions.findOne({ workshopId }, { sort: { order: -1 } });
      if (session) {
        return session.order;
      }
      return 0;
    };

    const id = Sessions.insert({
      projectId: workshop.projectId,
      workshopId,
      name,
      order: _findLastOrder() + 1,
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

Sessions.methods.move = new ValidatedMethod({
  name: "workshops.sessions.move",
  validate: new SimpleSchema({
    workshopId: { type: String },
    sessionId: { type: String },
    order: { type: Number }
  }).validator(),
  run({ workshopId, sessionId, order }) {
    const session = Sessions.findOne({ _id: sessionId });
    if (!session) {
      throw new Meteor.Error("not-found");
    }
    checkCanWriteProject(session.projectId);

    const _reorder = function() {
      const sessions = Sessions.find(
        { workshopId },
        { sort: { order: 1 } }
      ).fetch();
      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        session.order = i * 10;
        Sessions.update({ _id: session._id }, { $set: { order: session.order } });
      }
    };

    if (order) {
      Sessions.update({ _id: sessionId }, { $set: { order } }, {}, () => {
        _reorder();
      });
    } else {
      const lastSession = Sessions.findOne(
        { sessionId },
        { sort: { order: -1 } }
      );
      if (lastSession) {
        order = lastSession.order + 10;
      } else {
        order = 10;
      }
    }
  }
});
