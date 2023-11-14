import { publishComposite } from "meteor/reywood:publish-composite";
import { Projects } from "/imports/api/projects/projects";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import {
  Permissions,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

publishComposite("processDiagrams", async function(projectId) {
  return {
    find() {
      const userId = Meteor.userId();
      const query = {
        _id: projectId,
        deleted: { $ne: true }
      };
      if (!Permissions.isAdmin(userId)) {
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

publishComposite("processDiagram", async function(processDiagramId) {
  return {
    async find() {
      const processDiagram = await ProcessDiagrams.findOneAsync({ _id: processDiagramId });
      if (!processDiagram) {
        return this.ready();
      }
      await checkCanReadProject(processDiagram.projectId);
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
