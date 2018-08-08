import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { Lists } from "../../lists/lists";
import { Tasks } from "../../tasks/tasks";

// This code only runs on the server
Meteor.publish("projects", function projectsPublication(name) {
  if (name && name.length > 0) {
    return Projects.find({
      name: { $regex: ".*" + name + ".*", $options: "i" }
    });
  } else {
    return Projects.find();
  }
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
          return Lists.find({ projectId: project._id }, { sort: { order: 1 } });
        }
      },
      {
        // tasks
        find(project) {
          return Tasks.find({ projectId: project._id }, { sort: { order: 1 } });
        }
      },
      {
        // users
        find(project) {
          var members = project.members || [];
          return Meteor.users.find(
            { _id: { $in: members } },
            { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 } }
          );
        }
      }
    ]
  };
});
