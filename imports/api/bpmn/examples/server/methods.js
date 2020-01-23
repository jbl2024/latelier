import { Examples } from "../examples";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

Examples.methods.find = new ValidatedMethod({
  name: "bpmnExamples.find",
  validate: new SimpleSchema({
    page: { type: Number }
  }).validator(),
  run({ page }) {
    checkLoggedIn();

    const perPage = 25;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    const query = {};

    const count = Examples.find(query).count();
    const data = Examples.find(query, {
      skip,
      limit: perPage,
      sort: {
        name: 1
      }
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
