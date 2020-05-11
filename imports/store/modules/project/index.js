import filters from "./filters";

export default {
  namespaced: true,
  modules: {
    filters
  },
  state: {
    currentProjectId: null,
    currentProject: null,
    projectFeatures: []
  },
  mutations: {
    updateCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
    },
    updateCurrentProject(state, currentProject) {
      state.currentProject = currentProject;
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
        context.commit("updateCurrentProjectId", projectId);
        Meteor.call("projects.loadFeatures", { projectId }, (error, result) => {
          context.commit("updateProjectFeatures", result);
        });
      } else {
        context.commit("updateCurrentProjectId", null);
        context.commit("updateProjectFeatures", []);
      }
    },
    setCurrentProject(context, project) {
      context.commit("updateCurrentProject", project);
    }
  }
};
