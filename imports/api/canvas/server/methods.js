import carbone from "carbone";
import * as htmlToText from "html-to-text";
import { Meteor } from "meteor/meteor";
import { Canvas } from "/imports/api/canvas/canvas";
import { checkCanReadProject } from "/imports/api/permissions/permissions";

Canvas.methods.exportPDF = new ValidatedMethod({
  name: "canvas.exportODT",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  async run({ projectId }) {
    await checkCanReadProject(projectId);

    const source = Assets.absoluteFilePath("canvas/canvas.odt");
    const canvas = await Canvas.findOneAsync({ projectId });
    const context = canvas.data || {};
    Object.keys(context).forEach((key) => {
      context[key] = htmlToText.fromString(context[key]);
    });

    return new Promise((resolve, reject) => {
      carbone.render(source, context, (err, res) => {
        if (err) {
          reject(new Meteor.Error("error", err));
        } else {
          resolve({ data: res });
        }
      });
    });
  }
});
