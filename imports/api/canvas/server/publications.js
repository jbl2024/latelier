import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "/imports/api/projects/projects";
import { Canvas } from "/imports/api/canvas/canvas";


publishComposite("canvas", function(projectId) {
  return {
    find() {
      return Projects.find({ _id: projectId });
    },
    children: [
      {
        // lists
        find(project) {
          return Canvas.find({ projectId: project._id }, { sort: { order: 1 } });
        }
      }
    ]
  };
});
