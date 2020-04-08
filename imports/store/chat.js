const defaultChatChannel = Meteor ? Meteor.settings.public?.chat?.rocketChat?.defaultChatChannel : {};
const baseUrl = Meteor ? Meteor.settings.public?.chat?.rocketChat?.baseUrl : '';
const isEnabled = Meteor ? Boolean(Meteor.settings.public?.chat?.enabled) === true : false;
export const chat = {
  namespaced: true,
  state: {
    showChat: false,
    selectedChatChannel: defaultChatChannel,
    defaultChatChannel: Object.assign({}, defaultChatChannel),
    baseUrl,
    isEnabled
  },
  mutations: {
    updateShowChat(state, showChat) {
      state.showChat = showChat
    },
    updateSelectedChatChannel(state, selectedChatChannel) {
      state.selectedChatChannel = selectedChatChannel
    }
  },
  getters: {
    selectedChatChannelFullUrl(state) {
      return state.baseUrl + state.selectedChatChannel.channel + '?layout=embedded'
    }
  }
};
