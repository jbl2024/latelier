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
        },
        children: [
          {
            find(list) {
              return Meteor.users.find(
                { _id: list.createdBy },
                { fields: { profile: 1 } }
              );
            }
          }
        ]
      },
      {
        // tasks
        find(project) {
          return Tasks.find({ projectId: project._id }, { sort: { order: 1 } });
        },
        children: [
          {
            find(task) {
              var userIds = [task.createdBy];
              if (task.notes) {
                task.notes.map(note => {
                  userIds.push(note.createdBy);
                });
              }

              return Meteor.users.find(
                { _id: { $in: userIds } },
                { fields: { profile: 1 } }
              );
            }
          }
        ]
      },
      {
        find(project) {
          return Meteor.users.find(
            { _id: project.createdBy },
            { fields: { profile: 1 } }
          );
        }
      }
    ]
  };
});
