import express from "express";
const router = express.Router({mergeParams: true});
import { Organizations } from "/imports/api/organizations/organizations.js";
import { RestApiError } from "/imports/api/RestApi";
import projects from "/imports/api/tasks/server/rest.js";

router.get('/', function(req, res) {
    const query = {
        deleted: { $ne: true }
    };
    const organizations = Organizations.find(query).fetch();
    res.status(200).json(organizations).end();
});

router.get('/:organizationId', function(req, res) {
    const organizationId = req.params.organizationId;
    const query = {
        delete: { $ne : true },
        _id: organizationId
    };
    const organization = Organizations.findOne(query);
    if (!organization) {
        throw new RestApiError("not-found", 404);
    }
    res.status(200).json(organization).end();
});

router.use("/:organizationId/projects", projects);

export default router;