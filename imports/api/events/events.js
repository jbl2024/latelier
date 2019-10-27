import { Mongo } from "meteor/mongo";
import EventSchema from "./schema";

export const Events = new Mongo.Collection("events");
Events.attachSchema(EventSchema);
