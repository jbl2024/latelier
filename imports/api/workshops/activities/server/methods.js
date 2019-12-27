import { Meteor } from "meteor/meteor";
import { Activities } from "../activities";
import {
  checkLoggedIn,
  Permissions
} from "/imports/api/permissions/permissions";


Activities.methods.find = new ValidatedMethod({
  name: "workshops.activities.find",
  validate: new SimpleSchema({
    page: { type: Number },
    filter: { type: String, optional: true }
  }).validator(),
  run({ page, filter }) {
    checkLoggedIn();
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = { deleted: { $ne: true } };
    if (filter && filter.length > 0) {
      query.name = { $regex: `.*${filter}.*`, $options: "i" };
    }
    const count = Activities.find(query).count();
    const data = Activities.find(query, {
      skip,
      limit: perPage,
      sort: { name: 1 }
    }).fetch();
    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0;

    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});

Activities.methods.create = new ValidatedMethod({
  name: "workshops.activities.create",
  validate: new SimpleSchema({
    name: { type: String },
    description: { type: String, optional: true },
    goals: { type: String, optional: true }
  }).validator(),
  run({ name, description, goals }) {
    checkLoggedIn();
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const id = Activities.insert({
      name,
      description,
      goals,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return id;
  }
});
