import express from "express";
import { Lists } from "/imports/api/lists/lists.js";
import tasks from "/imports/api/tasks/server/rest.js";
import { RestApiError } from "/imports/api/RestApi";

const router = express.Router({ mergeParams: true });

router.get("/", function(req, res) {
  const query = {
    deleted: { $ne: true }
  };
  if (req.params.projectId) {
    query.projectId = req.params.projectId;
  }
  const lists = Lists.find(query).fetch();
  res.status(200).json(lists).end();
});

router.get("/:listId", function(req, res) {
  const { listId } = req.params;
  const query = {
    delete: { $ne: true },
    _id: listId
  };
  const list = Lists.findOne(query);
  if (!list) {
    throw new RestApiError("not-found", 404);
  }
  res.status(200).json(list).end();
});

router.use("/:listId/tasks", tasks);

export default router;
