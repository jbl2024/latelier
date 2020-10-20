import Handlebars from "handlebars";
import nodePandoc from "node-pandoc";
import fs from "fs";
import path from "path";
import os from "os";

export const compileTemplate = function(source, context, helpers = {}) {
  const template = Handlebars.compile(source);
  if (typeof helpers === "object" && helpers !== null) {
    Object.keys(helpers).forEach((helperName) => {
      Handlebars.registerHelper(helperName, helpers[helperName]);
    });
  }
  const html = template(context);
  return html;
};

export const convertHtml = function (html, format, cb) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "convert-"));
  const directoryAndFilename = `${directory}/output.${format}`;
  let args = ["-f", "html", "-o", directoryAndFilename];

  if (format === "pdf") {
    args = args.concat(["--pdf-engine=pdflatex"]);
  }
  nodePandoc(html, args, (err) => {
    if (err) {
      if (fs.existsSync(directoryAndFilename)) {
        fs.unlinkSync(directoryAndFilename);
      }
      if (fs.existsSync(directory)) {
        fs.rmdirSync(directory);
      }

      cb(err, null);
      return;
    }
    try {
      const data = fs.readFileSync(directoryAndFilename);
      fs.unlinkSync(directoryAndFilename);
      fs.rmdirSync(directory);
      cb(err, data);
    } catch (readError) {
      cb(readError, null);
    }
  });
};
