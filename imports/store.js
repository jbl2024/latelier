import Vuex from 'vuex'
import { Projects } from '/imports/api/projects/projects.js'

export const store = new Vuex.Store({
  state: {
    selectedGroup: {},
    showCategories: false,
    currentProjectId: 0,
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
    updateCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
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
    setCurrentProjectId (context, projectId) {
      context.commit('updateCurrentProjectId', projectId);
    },
    setHideDrawer (context, hideDrawer) {
      context.commit('updateHideDrawer', hideDrawer);
    }
  }
});
