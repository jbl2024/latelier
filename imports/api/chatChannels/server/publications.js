import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { ChatChannels } from "../chatChannels";

Meteor.publish("chatChannels", function chatChannelsPublication(
  name,
  channel,
  projectId
) {
  return ChatChannels.find();
});