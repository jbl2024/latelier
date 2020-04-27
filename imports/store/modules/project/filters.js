export default {
  namespaced: true,
  state: {
    selectedLabels: [],
    selectedAssignedTos: [],
    selectedUpdatedBy: []
  },
  mutations: {
    selectLabel(state, label) {
      const alreadySelected = state.selectedLabels.some(
        (aLabel) => aLabel._id === label._id
      );
      if (!alreadySelected) {
        state.selectedLabels.push(label);
      } else {
        state.selectedLabels = state.selectedLabels.filter(
          (aLabel) => aLabel._id !== label._id
        );
      }
    },
    selectLabels(state, labels) {
      state.selectedLabels = labels;
    },
    selectAssignedTos(state, assignedTos) {
      state.selectedAssignedTos = assignedTos;
    },
    selectUpdatedBy(state, selectedUpdatedBy) {
      state.selectedUpdatedBy = selectedUpdatedBy;
    },
    clearSelectedLabels(state) {
      state.selectedLabels = [];
    }
  },
  actions: {
    selectLabel(context, label) {
      context.commit("selectLabel", label);
    },
    selectLabels(context, labels) {
      context.commit("selectLabels", labels);
    },
    selectAssignedTos(context, users) {
      context.commit("selectAssignedTos", users);
    },
    selectUpdatedBy(context, selectedUpdatedBy) {
      context.commit("selectUpdatedBy", selectedUpdatedBy);
    },

    reset(context, { vm }) {
      context.commit("selectAssignedTos", []);
      context.commit("selectUpdatedBy", []);
      context.commit("selectLabels", []);
      // TODO replace event with store management
      vm.$events.fire("reset-filter-tasks");
    }
  }
};
