import { publishComposite } from "meteor/reywood:publish-composite";
import { Projects } from "/imports/api/projects/projects";
import { Mindmaps } from "/imports/api/mindmaps/mindmaps";
import {
  Permissions,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

publishComposite("mindmaps", function(projectId) {
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
          return Mindmaps.find(
            { projectId: project._id },
            { sort: { createdAt: 1 } }
          );
        }
      }
    ]
  };
});

publishComposite("mindmap", function(mindmapId) {
  return {
    find() {
      const mindmap = Mindmaps.findOne({ _id: mindmapId });
      if (!mindmap) {
        return this.ready();
      }
      checkCanReadProject(mindmap.projectId);
      return Mindmaps.find({ _id: mindmapId });
    },
    children: [
      {
        find(mindmap) {
          return Projects.find({ _id: mindmap.projectId });
        }
      }
    ]
  };
});
