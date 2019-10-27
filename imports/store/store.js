import Vue from "vue";
import Vuex from "vuex";
import { Meteor } from "meteor/meteor";

import get from "lodash/get";
import { projectFilters } from "./projectFilters";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    projectFilters
  },
  state: {
    selectedGroup: {},
    selectedTask: null,
    showSelectBackgroundDialog: false,
    showCategories: false,
    showTaskDetail: false,
    showTaskHistory: false,
    showDashboardTitle: false,
    dashboardFilter: "",
    currentOrganizationId: 0,
    currentProjectId: 0,
    projectFeatures: [],
    windowTitle: "",
    notifyMessage: "",
    showLabelText: false
  },
  getters: {
    hasProjectFeature: (state) => (feature) => {
      if (!state.projectFeatures) return false;
      return state.projectFeatures.find((feat) => feat === feature);
    }
  },
  mutations: {
    updateSelectedGroup(state, selectedGroup) {
      state.selectedGroup = selectedGroup;
    },
    updateShowCategories(state, showCategories) {
      state.showCategories = showCategories;
    },
    updateShowLabelText(state, showLabelText) {
      state.showLabelText = showLabelText;
    },
    updateShowSelectBackgroundDialog(state, showSelectBackgroundDialog) {
      state.showSelectBackgroundDialog = showSelectBackgroundDialog;
    },
    updateShowTaskDetail(state, showTaskDetail) {
      state.showTaskDetail = showTaskDetail;
    },
    updateShowTaskHistory(state, showTaskHistory) {
      state.showTaskHistory = showTaskHistory;
    },
    updateShowDashboardTitle(state, showDashboardTitle) {
      state.showDashboardTitle = showDashboardTitle;
    },
    updateDashboardFilter(state, dashboardFilter) {
      state.dashboardFilter = dashboardFilter;
    },
    updateCurrentProjectId(state, currentProjectId) {
      state.currentProjectId = currentProjectId;
    },
    setProjectFeatures(state, features) {
      state.projectFeatures = features;
    },
    updateCurrentOrganizationId(state, currentOrganizationId) {
      state.currentOrganizationId = currentOrganizationId;
    },
    selectTask(state, selectedTask) {
      state.selectedTask = selectedTask;
    },
    clearSelectedGroup(state) {
      state.selectedGroup = {};
    },
    notify(state, message) {
      state.notifyMessage = message;
    },
    updateWindowTitle(state, windowTitle) {
      let fullTitle = get(
        Meteor.settings,
        "public.seo.titlePrefix",
        "l'atelier"
      );
      if (windowTitle) {
        const titleValue = typeof windowTitle === "function" ? windowTitle.call(this) : windowTitle;
        fullTitle = `${fullTitle} - ${titleValue}`;
      }
      state.windowTitle = fullTitle;
    }
  },
  actions: {
    setSelectedGroup(context, selectedGroup) {
      if (!selectedGroup) {
        selectedGroup = {};
      }
      context.commit("updateSelectedGroup", selectedGroup);
    },
    setShowCategories(context, showCategories) {
      context.commit("updateShowCategories", showCategories);
    },
    setShowLabelText(context, showLabelText) {
      context.commit("updateShowLabelText", showLabelText);
    },
    setShowDashboardTitle(context, showDashboardTitle) {
      context.commit("updateShowDashboardTitle", showDashboardTitle);
    },
    setDashboardFilter(context, dashboardFilter) {
      context.commit("updateDashboardFilter", dashboardFilter);
    },
    showSelectBackgroundDialog(context, showSelectBackgroundDialog) {
      context.commit(
        "updateShowSelectBackgroundDialog",
        showSelectBackgroundDialog
      );
    },
    setCurrentProjectId(context, projectId) {
      context.commit("projectFilters/clearSelectedLabels");
      if (projectId !== 0) {
        Meteor.call("projects.loadFeatures", { projectId }, (error, result) => {
          context.commit("setProjectFeatures", result);
        });
      }
      context.commit("updateCurrentProjectId", projectId);
    },
    reloadProjectFeatures(context, projectId) {
      if (projectId !== 0) {
        Meteor.call("projects.loadFeatures", { projectId }, (error, result) => {
          context.commit("setProjectFeatures", result);
        });
      }
    },
    setCurrentOrganizationId(context, organizationId) {
      context.commit("clearSelectedGroup");
      context.commit("updateCurrentOrganizationId", organizationId);
    },
    selectTask(context, task) {
      context.commit("selectTask", task);
    },
    showTaskDetail(context, showTaskDetail) {
      context.commit("updateShowTaskDetail", showTaskDetail);
    },
    setWindowTitle(context, windowTitle) {
      context.commit("updateWindowTitle", windowTitle);
    },
    notify(context, message) {
      context.commit("notify", message);
    },
    notifyError(context, error) {
      if (error && error.reason) {
        context.commit("notify", error.reason);
      } else {
        context.commit("notify", error.error);
      }
    },
    showTaskHistory(context, showTaskHistory) {
      context.commit("updateShowTaskHistory", showTaskHistory);
    }
  }
});
export default store;
