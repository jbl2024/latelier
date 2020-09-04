import { Meteor } from "meteor/meteor";
import nodePandoc from "node-pandoc";
import fs from "fs";
import path from "path";
import os from "os";

const bound = Meteor.bindEnvironment((callback) => callback());

export const convertHtml = function(html, format) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "convert-"));
  const directoryAndFilename = `${directory}/output.${format}`;
  const future = new (Npm.require(
    Npm.require("path").join("fibers", "future")
  ))();
  bound(() => {
    nodePandoc(html, `-f html -o ${directoryAndFilename}`, (err) => {
      if (err) {
        throw new Meteor.Error("error", err);
      }
      const data = fs.readFileSync(directoryAndFilename);

      // cleanup
      fs.unlinkSync(directoryAndFilename);
      fs.rmdirSync(directory);

      future.return({
        data: data
      });
    });
  });
  return future.wait();
};
