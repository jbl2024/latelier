import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import ChatChannelSchema from "./schema";

export const ChatChannels = new Mongo.Collection("chatChannels");
ChatChannels.attachSchema(ChatChannelSchema);
ChatChannels.methods = {};
if (Meteor.isServer) {
  Meteor.startup(() => {
      ChatChannels.rawCollection().createIndex({ projectId: 1 });
  });
}
export const ChatChannelsTypes = Object.freeze({
  ROCKETCHAT: "rocketchat"
});