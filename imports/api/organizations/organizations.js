import { Mongo } from "meteor/mongo";

import OrganizationSchema from "./schema";

export const Organizations = new Mongo.Collection("organizations");
Organizations.attachSchema(OrganizationSchema);
Organizations.methods = {};
