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
    },
    currentProjectColor: (state) => state.currentProject && state.currentProject.color
      ? state.currentProject.color : null
  },
  actions: {
    async setCurrentProjectId(context, projectId) {
      context.commit("filters/clearSelectedLabels");
      if (projectId != null) {
        const result = await Meteor.callAsync("projects.loadFeatures", { projectId });
        context.commit("updateProjectFeatures", result);
        if (context.state.currentProject && (context.state.currentProject._id !== projectId)) {
          context.commit("updateProjectFeatures", []);
          context.commit("updateCurrentProject", null);
        }
      }
      context.commit("updateCurrentProjectId", projectId);
    },
    setCurrentProject(context, project) {
      if (project == null) {
        context.commit("updateCurrentProject", null);
        context.commit("updateCurrentProjectId", null);
      } else {
        context.commit("updateCurrentProjectId", project._id);
        context.commit("updateCurrentProject", project);
      }
    }
  }
};
