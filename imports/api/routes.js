import express from "express";
import projects from "/imports/api/projects/server/rest.js";
import tasks from "/imports/api/tasks/server/rest.js";
import organizations from "/imports/api/organizations/server/rest.js";
import users from "/imports/api/users/server/rest.js";
import listEndpoints from "express-list-endpoints";
import { RestApiError } from "/imports/api/RestApi";

const routes = express.Router();

routes.use("/projects", projects);
routes.use("/tasks", tasks);
routes.use("/organizations", organizations);
routes.use("/users", users);

// Listing all API Routes
if (Meteor.isDevelopment) {
  routes.get("/routes", function({ res }) {
    res.status(200).json(listEndpoints(routes).map((endpoint) => `${endpoint.path} [${endpoint.methods.join(",")}]`)).end();
  });
}

routes.all("*", () => {
  throw new RestApiError("Method Not Allowed", 405);
});

export default routes;
