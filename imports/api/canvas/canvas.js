import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import CanvasSchema from "./schema";

export const Canvas = new Mongo.Collection("canvas");
Canvas.attachSchema(CanvasSchema);

if (Meteor.isServer) {
  Meteor.startup(() => {
    Canvas.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  "canvas.update"(projectId, data) {
    check(projectId, String);
    check(data, Object);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    const canvas = Canvas.findOne({ projectId });
    const existingData = canvas.data || {};
    const finalData = Object.assign(existingData, data);

    Canvas.update(
      {
        projectId
      },
      {
        $set: {
          data: finalData
        }
      }
    );
  },

  "canvas.get"(projectId) {
    check(projectId, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    let canvas = Canvas.findOne({ projectId });
    if (!canvas) {
      Canvas.insert({
        projectId,
        createdAt: new Date(),
        createdBy: Meteor.userId(),
        data: {
          goal: "",
          budget: "",
          team: "",
          requirements: "",
          resources: "",
          risks: "",
          milestones: "",
          quality: "",
          outcome: "",
          customers: "",
          planning: ""
        }
      });
      canvas = Canvas.findOne({ projectId });
    }
    return canvas;
  }
});
