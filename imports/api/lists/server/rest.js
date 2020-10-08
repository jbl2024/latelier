import express from "express";
const router = express.Router({mergeParams: true});
import { Lists } from "/imports/api/lists/lists.js";
import tasks from "/imports/api/tasks/server/rest.js";

router.get('/', function(req, res) {
    const query = {
        deleted: { $ne: true }
    };
    if (req.params.projectId) {
        query.projectId = req.params.projectId;
    }
    const lists = Lists.find(query).fetch();
    res.status(200).json(lists);
});

router.get('/:listId', function(req, res) {
    const listId = req.params.listId;
    const query = {
        delete: { $ne : true },
        _id: listId
    };
    const list = Lists.findOne(query)
    res.status(200).json(list);
});

router.use("/:listId/tasks", tasks);

export default router;