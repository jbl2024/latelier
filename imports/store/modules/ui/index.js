export default {
  namespaced: true,
  state: {
    defaultNavigationColor: "#363636",
    navigationColor: "#363636",
    navColor: "#555555"
  },
  mutations: {
    updateNavigationColor(state, color) {
      state.navigationColor = color;
    }
  },
  actions: {
    setNavigationColor(context, color) {
      context.commit("updateNavigationColor", color);
    },
    resetNavigationColor(context) {
      context.commit("updateNavigationColor", context.state.defaultNavigationColor);
    }
  }
};
