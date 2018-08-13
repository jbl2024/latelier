import Vuex from 'vuex'

export const store = new Vuex.Store({
  state: {
    selectedGroup: {}
  },
  getters: {
    // Compute derived state based on the current state. More like computed property.
  },
  mutations: {
    updateSelectedGroup(state, selectedGroup) {
      state.selectedGroup = selectedGroup
    }
  },
  actions: {
    setSelectedGroup (context, selectedGroup) {
      if (!selectedGroup) {
        selectedGroup = {};
      }
      context.commit('updateSelectedGroup', selectedGroup);
    }
  }
});
