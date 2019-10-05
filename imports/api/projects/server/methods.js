import { Projects } from "../projects";
import { Permissions, checkLoggedIn, checkCanReadProject, checkCanWriteProject } from "/imports/api/permissions/permissions"

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
    let query = { deleted: {$ne: true} };
  
    if (!Permissions.isAdmin(userId)) {
      query['$or'] = [{createdBy: userId}, {members: userId}];
    }
  
    if (name && name.length > 0) {
      query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
    } 
    if (organizationId) {
      query['organizationId'] = organizationId;
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
      skip: skip,
      limit: perPage,
      sort: {
        name: 1
      }
    }).fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  }
});
