import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { Lists } from "../../lists/lists";

// This code only runs on the server
Meteor.publish("projects", function projectsPublication() {
  return Projects.find();
});

publishComposite("project", function(projectId) {
  return {
    find() {
      return Projects.find({ _id: projectId });
    },
    children: [
      {
        // lists
        find(project) {
          return Lists.find({ projectId: project._id });
        }
      }
    ]
  }
});
