import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "/imports/api/projects/projects";
import { HealthReports } from "/imports/api/healthReports/healthReports";


publishComposite("healthReports", function(projectId) {
  return {
    find() {
      return Projects.find({ _id: projectId });
    },
    children: [
      {
        find(project) {
          return HealthReports.find({projectId: project._id}, {sort: { startDate: 1}});
        }
      }
    ]
  };
});
