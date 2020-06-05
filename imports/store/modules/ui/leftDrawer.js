export default {
  namespaced: true,
  state: {
    showLeftDrawer: null,
    currentCategory: "tasks"
  },
  mutations: {
    updateShowLeftDrawer(state, showLeftDrawer) {
      state.showLeftDrawer = showLeftDrawer;
    },
    updateCurrentCategory(state, category) {
      state.currentCategory = category;
    }
  },
  actions: {
    showLeftDrawer(context, showLeftDrawer) {
      context.commit("updateShowLeftDrawer", showLeftDrawer);
    },
    setCurrentCategory(context, category) {
      context.commit("updateCurrentCategory", category);
    }
  }
}