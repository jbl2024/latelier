import filters from "./filters";

import { Projects } from "/imports/api/projects/projects.js";


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
        Meteor.call("projects.loadFeatures", { projectId }, (error, result) => {
          context.commit("updateProjectFeatures", result);
        });
      }
      Tracker.autorun(() => {
        let subProject = Meteor.subscribe("project", projectId);
        if (subProject.ready()) {
          const project = Projects.findOne({_id: projectId});
          context.commit("updateCurrentProject", project ? project : null);
        }
      });
      context.commit("updateCurrentProjectId", projectId);
    }
  }
};
