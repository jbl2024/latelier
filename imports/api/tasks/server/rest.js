import express from "express";
const router = express.Router({ mergeParams : true });
import { Tasks } from "/imports/api/tasks/tasks.js";
import { isNumeric } from "/imports/utils/";

router.get('/', function(req, res) {
    const query = {
        deleted: { $ne: true }
    };
    if (req.params.projectId) {
        query.projectId = req.params.projectId;
    }
    if (req.params.listId) {
        query.listId = req.params.listId;
    }
    const tasks = Tasks.find(query).fetch();
    res.status(200).json(tasks);
});

router.get('/:taskId', function(req, res) {
    const taskId = req.params.taskId;
    const isNumber = isNumeric(taskId);
    const query = {delete: { $ne : true }};
    if (isNumber) {
        query.number = parseInt(taskId, 10);
    } else {
        query._id = taskId;
    }
    const task = Tasks.findOne(query);
    res.status(200).json(task);
});

export default router;