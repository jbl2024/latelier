import filters from "./filters";
export default {
  namespaced: true,
  modules: {
    filters
  },
  state: {
    currentProjectId: null,
    projectFeatures: [],
  },
  mutations: {
    updateCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
    },
    updateProjectFeatures(state, features) {
      state.projectFeatures = features;
    }
  },
  getters: {
    hasProjectFeature: (state) => (feature) => {
      if (!state.projectFeatures) return false;
      return state.projectFeatures.find((feat) => feat === feature);
    }
  },
  actions: {
    setCurrentProjectId(context, projectId) {
      context.commit("filters/clearSelectedLabels");
      if (projectId) {
        Meteor.call("projects.loadFeatures", { projectId }, (error, result) => {
          context.commit("updateProjectFeatures", result);
        });
      }
      context.commit("updateCurrentProjectId", projectId);
    }
  }
}