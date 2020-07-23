
import Api from "/imports/api/Api";

export default {
  namespaced: true,
  state: {
    currentOrganizationId: null,
    currentOrganization: null
  },
  mutations: {
    updateCurrentOrganizationId(state, currentOrganizationId) {
      state.currentOrganizationId = currentOrganizationId;
    },
    updateCurrentOrganization(state, currentOrganization) {
      state.currentOrganization = currentOrganization;
    }
  },
  actions: {
    setCurrentOrganizationId(context, organizationId) {
      context.commit("clearSelectedGroup", null, { root: true });
      if (organizationId != null) {
        if (context.state.currentOrganizationId
          && (context.state.currentOrganizationId !== organizationId)) {
          context.commit("updateCurrentOrganization", null);
        }
      }
      context.commit("updateCurrentOrganizationId", organizationId);
    },
    setCurrentOrganization(context, organization) {
      if (organization == null) {
        context.commit("updateCurrentOrganizationId", null);
        context.commit("updateCurrentOrganization", null);
      } else {
        context.commit("clearSelectedGroup", null, { root: true });
        // Organizations features sums all related projects features
        Api.call("organizations.getFeatures", {
          organizationId: organization._id
        }).then((features) => {
          organization.features = Array.isArray(features) ? features : [];
          context.commit("updateCurrentOrganizationId", organization._id);
          context.commit("updateCurrentOrganization", organization);
        }).catch(() => {
          context.commit("updateCurrentOrganizationId", organization._id);
          context.commit("updateCurrentOrganization", organization);
        });
      }
    }
  }
};
