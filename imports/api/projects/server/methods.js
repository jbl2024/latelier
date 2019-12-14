import { Projects } from "../projects";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams.js";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

Projects.methods.load = new ValidatedMethod({
  name: "projects.load",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    organizationId: { type: String, optional: true },
    page: { type: Number }
  }).validator(),
  run({ name, organizationId, page }) {
    checkLoggedIn();

    const userId = Meteor.userId();
    const query = { deleted: { $ne: true } };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = Projects.find(query).count();
    const data = Projects.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data
    };
  }
});

Projects.methods.info = new ValidatedMethod({
  name: "projects.info",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    checkCanReadProject(projectId);
    const project = Projects.findOne({ _id: projectId });
    const taskCount = Tasks.find({
      projectId: projectId,
      deleted: { $ne: true }
    }).count();

    const userCount = (project.members || []).length;
    const diagramCount = ProcessDiagrams.find({ projectId: projectId }).count();

    return {
      taskCount: taskCount,
      userCount: userCount,
      diagramCount: diagramCount
    };
  }
});
