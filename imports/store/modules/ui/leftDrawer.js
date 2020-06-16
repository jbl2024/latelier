export default {
  namespaced: true,
  state: {
    showLeftDrawer: null
  },
  mutations: {
    updateShowLeftDrawer(state, showLeftDrawer) {
      state.showLeftDrawer = showLeftDrawer;
    }
  },
  actions: {
    showLeftDrawer(context, showLeftDrawer) {
      context.commit("updateShowLeftDrawer", showLeftDrawer);
    }
  }
};
