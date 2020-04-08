import { Mongo } from "meteor/mongo";
import ChatChannelSchema from "./schema";

export const ChatChannels = new Mongo.Collection("chatChannels");
ChatChannels.attachSchema(ChatChannelSchema);
ChatChannels.methods = {};
export const ChatChannelsTypes = Object.freeze({
  ROCKETCHAT: "rocketchat"
});