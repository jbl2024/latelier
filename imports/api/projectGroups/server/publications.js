import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

import { ProjectGroups } from "../projectGroups";
import { checkCanReadOrganization } from "../../permissions/permissions";

Meteor.publish("projectGroups", async function projectGroups(organizationId, name) {
  check(organizationId, String);
  check(name, Match.Maybe(String));

  await checkCanReadOrganization(organizationId);

  const query = {};
  if (name && name.length > 0) {
    query.name = { $regex: `.*${name}.*`, $options: "i" };
  }
  if (organizationId) {
    query.organizationId = organizationId;
  }
  return ProjectGroups.find(query);
});
