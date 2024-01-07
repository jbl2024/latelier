import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { checkCanReadProject, checkCanWriteProject } from "/imports/api/permissions/permissions";

import CanvasSchema from "./schema";

export const Canvas = new Mongo.Collection("canvas");
Canvas.attachSchema(CanvasSchema);
Canvas.methods = {};

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await Canvas.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  async "canvas.update"(projectId, data) {
    check(projectId, String);
    check(data, Object);

    await checkCanWriteProject(projectId);

    const canvas = await Canvas.findOneAsync({ projectId });
    const existingData = canvas.data || {};
    const finalData = Object.assign(existingData, data);

    await Canvas.updateAsync(
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

  async "canvas.get"(projectId) {
    check(projectId, String);

    await checkCanReadProject(projectId);

    let canvas = await Canvas.findOneAsync({ projectId });
    if (!canvas) {
      await Canvas.insertAsync({
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
      canvas = await Canvas.findOneAsync({ projectId });
    }
    return canvas;
  }
});
