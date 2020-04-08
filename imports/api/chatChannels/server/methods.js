import { ChatChannels, ChatChannelsTypes } from "../chatChannels";
import { checkLoggedIn, checkAdmin } from "/imports/api/permissions/permissions";

ChatChannels.methods.load = new ValidatedMethod({
  name: "chatChannels.load",
  validate: new SimpleSchema({
    page: {type: Number}
  }).validator(),
  run({ page }) {
    checkLoggedIn();
    checkAdmin();
    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }
    if (!skip) {
      skip = 0;
    }
    const query = {};
    const count = ChatChannels.find(query).count();
    const data = ChatChannels
      .find(query, {
        skip,
        limit: perPage,
        sort: {
          name: 1
        }
      })
    .fetch();
    const totalPages = perPage !== 0 ? Math.ceil(count / perPage) : 0
    return {
      rowsPerPage: perPage,
      totalItems: count,
      totalPages: totalPages,
      data
    };
  }
});


ChatChannels.methods.create = new ValidatedMethod({
  name: "chatChannels.create",
  validate: new SimpleSchema({
    name: {type: String},
    channel: {type: String},
    projectId: {type: String, optional: true}
  }).validator(),
  run({ name, channel, projectId }) {
    checkLoggedIn();
    checkAdmin();
    const now = new Date();
    const chatChannelId = ChatChannels.insert({
      projectId,
      name,
      channel,
      type: ChatChannelsTypes.ROCKETCHAT,
      createdAt: now,
      updatedAt: now,
      createdBy: Meteor.userId(),
    });
    return chatChannelId;
  }
})

ChatChannels.methods.update = new ValidatedMethod({
  name: "chatChannels.update",
  validate: new SimpleSchema({
    id: {type: String},
    name: {type: String},
    channel: {type: String},
    projectId: {type: String, optional: true}
  }).validator(),
  run({ id, name, channel, projectId}) {
    checkLoggedIn();
    checkAdmin();
    const chatChannel = ChatChannels.findOne({ _id: id });
    if (!chatChannel) {
      throw new Meteor.Error("not-found");
    }
    const now = new Date();
    const chatChannelId = ChatChannels.update(
      {
        _id: id
      },
      {
        $set: {
          name,
          channel,
          projectId,
          updatedAt: now
        }
      }
    );
    return chatChannelId;
  }
})

ChatChannels.methods.remove = new ValidatedMethod({
  name: "chatChannels.remove",
  validate: new SimpleSchema({
    chatChannelId: { type: String }
  }).validator(),
  run({ chatChannelId }) {
    checkAdmin();
    const chatChannel = ChatChannels.findOne({ _id: chatChannelId });
    if (!chatChannel) {
      throw new Meteor.Error("not-found");
    }
    ChatChannels.remove({ _id: chatChannelId });
  }
});