import { colors } from "/imports/colors";
import leftDrawer from "./leftDrawer";

export default {
  namespaced: true,
  modules: {
    leftDrawer
  },
  state: {
    defaultNavigationColor: "#363636",
    navigationColor: "#363636",
    navColor: "#555555",
    showHelp: false
  },
  mutations: {
    updateNavigationColor(state, color) {
      state.navigationColor = color;
    },
    updateShowHelp(state, showHelp) {
      state.showHelp = showHelp;
    }
  },
  getters: {
    showHelp: (state) => state.showHelp,
    isNavigationColorDark: (state) => colors.isDark(state.navigationColor),
    navigationColorBrightness: (state) => colors.getBrightness(state.navigationColor),
    isContentDark: (state, getters) => getters.navigationColorBrightness < 60
    || getters.navigationColorBrightness > 128
  },
  actions: {
    setNavigationColor(context, color) {
      context.commit("updateNavigationColor", color);
    },
    resetNavigationColor(context) {
      context.commit("updateNavigationColor", context.state.defaultNavigationColor);
    },
    toggleShowHelp(context) {
      context.commit("updateShowHelp", !context.state.showHelp);
    },
    showHelp(context, showHelp) {
      context.commit("updateShowHelp", showHelp);
    }
  }
};
