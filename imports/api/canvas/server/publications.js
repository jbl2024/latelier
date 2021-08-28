import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "/imports/api/projects/projects";
import { Canvas } from "/imports/api/canvas/canvas";
import { Permissions } from "/imports/api/permissions/permissions";

publishComposite("canvas", function (projectId) {
  return {
    find() {
      const userId = Meteor.userId();
      const query = {
        _id: projectId,
        deleted: { $ne: true }
      };
      if (!Permissions.isAdmin(Meteor.userId())) {
        query.$or = [
          { createdBy: userId },
          { members: userId },
          { isPublic: true }
        ];
      }

      return Projects.find(query);
    },
    children: [
      {
        // lists
        find(project) {
          const canvas = Canvas.findOne({ projectId });
          if (!canvas) {
            Canvas.insert({
              projectId,
              createdAt: new Date(),
              createdBy: Meteor.userId(),
              data: {
                goal: "",
                budget: "",
                team: "",
                requirements: "",
                resources: "",
                risks: "",
                milestones: "",
                quality: "",
                outcome: "",
                customers: "",
                planning: ""
              }
            });
          }
          return Canvas.find(
            { projectId: project._id },
            { sort: { order: 1 } }
          );
        }
      }
    ]
  };
});
