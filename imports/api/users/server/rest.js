import express from "express";
const router = express.Router();
import tasks from "/imports/api/tasks/server/rest.js";

const excludedFields = { fields: { services: 0 } };

router.get("/", function(req, res) {
    const users = Meteor.users.find({}, excludedFields).fetch();
    res.status(200).json(users);
});

router.get("/:userId", function(req, res) {
    const user = Meteor.users.findOne({ _id: req.params.userId }, excludedFields);
    res.status(200).json(user);
});

router.use("/:userId/tasks", tasks);

export default router;