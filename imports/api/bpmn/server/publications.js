import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "/imports/api/projects/projects";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { Permissions } from "/imports/api/permissions/permissions";
import { checkCanReadProject } from "../../permissions/permissions";

publishComposite("processDiagrams", function(projectId) {
  return {
    find() {
      const userId = Meteor.userId();
      const query = {
        _id: projectId,
        deleted: { $ne: true }
      };
      if (!Permissions.isAdmin(userId)) {
        query["$or"] = [
          { createdBy: userId },
          { members: userId },
          { isPublic: true }
        ];
      }
      return Projects.find(query);
    },
    children: [
      {
        find(project) {
          return ProcessDiagrams.find(
            { projectId: project._id },
            { sort: { createdAt: 1 } }
          );
        }
      }
    ]
  };
});

publishComposite("processDiagram", function(processDiagramId) {
  return {
    find() {
      const processDiagram = ProcessDiagrams.findOne({ _id: processDiagramId });
      if (!processDiagram) {
        return this.ready();
      }
      checkCanReadProject(processDiagram.projectId);
      return ProcessDiagrams.find({ _id: processDiagramId });
    },
    children: [
      {
        find(processDiagram) {
          return Projects.find({ _id: processDiagram.projectId });
        }
      }
    ]
  };
});
