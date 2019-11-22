import weasyprint from "weasyprint-wrapper";
import get from "lodash/get";

export const print = {
  htmlToPdf(input, cb) {
    weasyprint.command = get(Meteor.settings, "weasyprint.path", "weasyprint");
    const chunks = [];
    const stream = weasyprint(input);
    if (!stream) {
      cb("no-stream", null);
      return;
    }
    stream.on("data", function(data) {
      chunks.push(data);
    });
    stream.on("end", function() {
      const res = Buffer.concat(chunks);
      cb(null, res);
    });
  }
};
