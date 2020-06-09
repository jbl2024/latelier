export default {
  namespaced: true,
  state: {
    currentCategory: "tasks"
  },
  mutations: {
    updateCurrentCategory(state, category) {
      state.currentCategory = category;
    }
  },
  actions: {
    setCurrentCategory(context, category) {
      context.commit("updateCurrentCategory", category);
    }
  }
};
