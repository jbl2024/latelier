import express from "express";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { isNumeric } from "/imports/utils/";
import { RestApiError } from "/imports/api/RestApi";

const router = express.Router({ mergeParams: true });

router.get("/", function(req, res) {
  const query = {
    deleted: { $ne: true }
  };
  if (req.params.projectId) {
    query.projectId = req.params.projectId;
  }
  if (req.params.listId) {
    query.listId = req.params.listId;
  }

  if (req.params.userId) {
    query.$or = [
      { createdBy: req.params.userId },
      { updatedBy: req.params.userId }
    ];
  }
  const tasks = Tasks.find(query).fetch();
  res.status(200).json(tasks).end();
});

router.get("/:taskId", function(req, res) {
  const { taskId } = req.params;
  const isNumber = isNumeric(taskId);
  const query = { delete: { $ne: true } };
  if (isNumber) {
    query.number = parseInt(taskId, 10);
  } else {
    query._id = taskId;
  }
  const task = Tasks.findOne(query);
  if (!task) {
    throw new RestApiError("not-found", 404);
  }
  res.status(200).json(task).end();
});

router.post("/", function(req, res) {
  Meteor.call(
    "tasks.insert",
    "qhr6zJnjKDq9QnDp9",
    "EsecabSogj95f8zP7",
    "Nouvelle tâche",
    (error, task) => {
      if (error) {
        throw new RestApiError("Unprocessable entity", 422);
      }
      res.status(200).json(task).end();
    }
  );
});

export default router;
