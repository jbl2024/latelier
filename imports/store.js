import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    selectedGroup: {},
    selectedTask: null,
    selectedLabels: [],
    selectedAssignedTos: [],
    showCategories: false,
    showTaskDetail: false,
    currentOrganizationId: 0,
    currentProjectId: 0,
    notifyMessage: ''
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
    updateShowTaskDetail(state, showTaskDetail) {
      state.showTaskDetail = showTaskDetail;
    },
    updateCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
    },
    updateCurrentOrganizationId(state, currentOrganizationId) {
      state.currentOrganizationId = currentOrganizationId;
    },
    selectLabel(state, label) {
      var alreadySelected = state.selectedLabels.some( aLabel => {
        return aLabel._id == label._id;
      });
      if (!alreadySelected) {
        state.selectedLabels.push(label);
      } else {
        state.selectedLabels = state.selectedLabels.filter( aLabel => {
          return aLabel._id != label._id
        });
      }
    },
    selectLabels(state, labels) {
      state.selectedLabels = labels;
    },
    selectAssignedTos(state, assignedTos) {
      state.selectedAssignedTos = assignedTos;
    },
    selectTask(state, selectedTask) {
      state.selectedTask = selectedTask;
    },
    clearSelectedLabels(state) {
      state.selectedLabels = [];
    },
    clearSelectedGroup(state) {
      state.selectedGroup = {};
    },
    notify(state, message) {
      state.notifyMessage = message;
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
      context.commit('clearSelectedLabels');
      context.commit('updateCurrentProjectId', projectId);
    },
    setCurrentOrganizationId (context, organizationId) {
      context.commit('clearSelectedGroup');
      context.commit('updateCurrentOrganizationId', organizationId);
    },
    selectLabel(context, label) {
      context.commit('selectLabel', label);
    },
    selectLabels(context, labels) {
      context.commit('selectLabels', labels);
    },
    selectAssignedTos(context, users) {
      context.commit('selectAssignedTos', users);
    },
    selectTask(context, task) {
      context.commit('selectTask', task);
    },
    showTaskDetail(context, showTaskDetail) {
      context.commit('updateShowTaskDetail', showTaskDetail);
    },
    resetProjectFilters(context, { vm }) {
      context.commit('selectAssignedTos', []);
      context.commit('selectLabels', []);
      
      // TODO replace event with store management
      vm.$events.fire("reset-filter-tasks");
    },
    notify(context, message) {
      context.commit('notify', message);
    },
    notifyError(context, error) {
      if (error && error.reason) {
        context.commit('notify', error.reason);
      } else {
        context.commit('notify', error.error);
      }
    }
  }
});
