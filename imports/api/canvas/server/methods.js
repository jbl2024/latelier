import { Meteor } from "meteor/meteor";
import { Canvas } from "/imports/api/canvas/canvas";
import { checkLoggedIn } from "/imports/api/permissions/permissions";
import { print } from "/imports/print";
import * as Handlebars from "handlebars";

const bound = Meteor.bindEnvironment((callback) => callback());

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

    const future = new (Npm.require(Npm.require("path").join("fibers", "future")))();

    bound(() => {
      print.htmlToPdf(html, (err, res) => {
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
