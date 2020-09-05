import Handlebars from "handlebars";
import nodePandoc from "node-pandoc";
import fs from "fs";
import path from "path";
import os from "os";

export const compileTemplate = function(source, context) {
  const template = Handlebars.compile(source);
  const html = template(context);
  return html;
};

export const convertHtml = function (html, format, cb) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "convert-"));
  const directoryAndFilename = `${directory}/output.${format}`;
  nodePandoc(html, `-f html -o ${directoryAndFilename}`, (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    const data = fs.readFileSync(directoryAndFilename);

    // cleanup
    fs.unlinkSync(directoryAndFilename);
    fs.rmdirSync(directory);

    cb(err, data);
  });
};
