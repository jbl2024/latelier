import Vuex from 'vuex'
import { Projects } from '/imports/api/projects/projects.js'

export const store = new Vuex.Store({
  state: {
    selectedGroup: {},
    showCategories: false,
    currentProject: null,
    hideDrawer: false
  },
  getters: {
    // Compute derived state based on the current state. More like computed property.
  },
  mutations: {
    updateSelectedGroup(state, selectedGroup) {
      state.selectedGroup = selectedGroup
    },
    updateShowCategories(state, showCategories) {
      state.showCategories = showCategories
    },
    updateCurrentProject(state, currentProjectId) {
      if (currentProjectId != 0) {
        state.currentProject = Projects.findOne({_id: currentProjectId});
      } else {
        state.currentProject = null;
      }
    },
    updateHideDrawer(state, hideDrawer) {
      state.hideDrawer = hideDrawer
    }
  },
  actions: {
    setSelectedGroup (context, selectedGroup) {
      if (!selectedGroup) {
        selectedGroup = {};
      }
      context.commit('updateSelectedGroup', selectedGroup);
    },
    setShowCategories (context, showCategories) {
      context.commit('updateShowCategories', showCategories);
    },
    setCurrentProject (context, projectId) {
      context.commit('updateCurrentProject', projectId);
    },
    setHideDrawer (context, hideDrawer) {
      context.commit('updateHideDrawer', hideDrawer);
    }
  }
});
