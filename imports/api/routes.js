import express from "express";
import projects from "/imports/api/projects/server/rest.js";
import tasks from "/imports/api/tasks/server/rest.js";
import organizations from "/imports/api/organizations/server/rest.js";
import users from "/imports/api/users/server/rest.js";

const routes = express.Router();

routes.use("/projects", projects);
routes.use("/tasks", tasks);
routes.use("/organizations", organizations);
routes.use("/users", users);

export default routes;