import express from "express";
const router = express.Router();
import { Projects } from "/imports/api/projects/projects.js";
import lists from "/imports/api/lists/server/rest.js";
import tasks from "/imports/api/tasks/server/rest.js";

router.get("/", function(req, res) {
    const projects = Projects.find({
        deleted: { $ne: true }
    }).fetch();
    res.status(200).json(projects);
});

router.get("/:projectId", function(req, res) {
    const projectId = req.params.projectId;
    const query = {
        delete: { $ne : true },
        _id: projectId
    };
    const project = Projects.findOne(query)
    res.status(200).json(project);
});

router.use("/:projectId/lists", lists);
router.use("/:projectId/tasks", tasks);

export default router;