export const chat = {
  namespaced: true,
  state: {
    showChat: false
  },
  mutations: {
    updateShowChat(state, showChat) {
      state.showChat = showChat
    }
  }
};
