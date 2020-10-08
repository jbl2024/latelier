import express from "express";
const router = express.Router({mergeParams: true});
import { Organizations } from "/imports/api/organizations/organizations.js";
import projects from "/imports/api/tasks/server/rest.js";

router.get('/', function(req, res) {
    const query = {
        deleted: { $ne: true }
    };
    const organizations = Organizations.find(query).fetch();
    res.status(200).json(organizations);
});

router.get('/:organizationId', function(req, res) {
    const organizationId = req.params.organizationId;
    const query = {
        delete: { $ne : true },
        _id: organizationId
    };
    const organization = Organizations.findOne(query)
    res.status(200).json(organization);
});

router.use("/:organizationId/projects", projects);

export default router;