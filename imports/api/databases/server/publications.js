import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "/imports/api/projects/projects";
import { Databases } from "/imports/api/databases/databases";


publishComposite("databases", function(projectId) {
  return {
    find() {
      return Projects.find({ _id: projectId });
    },
    children: [
      {
        find(project) {
          return Databases.find({projectId: project._id}, {sort: { startDate: 1}});
        }
      }
    ]
  };
});

publishComposite("database", function(databaseId) {
  return {
    find() {
      return Databases.find({ _id: databaseId });
    },
    children: [
      {
        find(database) {
          return Projects.find({_id: database.projectId});
        }
      }
    ]
  };
});

