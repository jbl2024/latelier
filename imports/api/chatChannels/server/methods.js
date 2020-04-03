import { ChatChannels, ChatChannelsTypes } from "../chatChannels";
import { Permissions, checkLoggedIn, checkAdmin } from "/imports/api/permissions/permissions";
import moment from "moment";
ChatChannels.methods.load = new ValidatedMethod({
  name: "chatChannels.load",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    projectId: { type: String, optional: true },
    page: { type: Number }
  }).validator(),
  run({ name, projectId, page }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    const query = { deleted: { $ne: true } };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (projectId) {
      query.projectId = projectId;
    }

    const perPage = 5;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }

    const count = ChatChannels.find(query).count();
    const data = ChatChannels.find(query, {
      skip,
      limit: perPage,
      sort: {name: 1}
    }).fetch();
    return {
      rowsPerPage: perPage,
      totalItems: count,
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
    name: {type: String},
    channel: {type: String},
    projectId: {type: String, optional: true}
  }).validator(),
  run({ name, channel, projectId}) {
    checkLoggedIn();
    checkAdmin();
  }
})

ChatChannels.methods.adminFind = new ValidatedMethod({
  name: "admin.findChatChannels",
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