import Vuex from 'vuex'

export const store = new Vuex.Store({
  state: {
    selectedGroup: {},
    showCategories: false,
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
    setHideDrawer (context, hideDrawer) {
      context.commit('updateHideDrawer', hideDrawer);
    }
  }
});
