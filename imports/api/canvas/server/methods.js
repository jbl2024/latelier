import { Meteor } from "meteor/meteor";
import { Canvas } from "/imports/api/canvas/canvas";
import { checkCanReadProject } from "/imports/api/permissions/permissions";
import * as htmlToText from "html-to-text";
import carbone from "carbone";

const bound = Meteor.bindEnvironment((callback) => callback());

Canvas.methods.exportPDF = new ValidatedMethod({
  name: "canvas.exportODT",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkCanReadProject(projectId);

    const source = Assets.absoluteFilePath("canvas/canvas.odt");
    const canvas = Canvas.findOne({ projectId });
    const context = canvas.data || {};
    Object.keys(context).forEach((key) => {
      context[key] = htmlToText.fromString(context[key]);
    });
    const future = new (Npm.require(
      Npm.require("path").join("fibers", "future")
    ))();

    bound(() => {
      carbone.render(source, context, (err, res) => {
        if (err) {
          throw new Meteor.Error("error", err);
        }
        future.return({
          data: res
        });
      });
    });
    return future.wait();
  }
});
