import { Meteor } from "meteor/meteor";
import { Canvas } from "/imports/api/canvas/canvas";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

import * as Handlebars from "handlebars";

Canvas.methods.exportPDF = new ValidatedMethod({
  name: "canvas.exportPDF",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();

    const source = Assets.getText("canvas/canvas.html");
    const template = Handlebars.compile(source);
    const context = {};
    const html = template(context);
    return {
      data: html
    };
  }
});
