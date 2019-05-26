import Vue from 'vue'
import Vuex from 'vuex'
import { projectFilters } from "./projectFilters";
import get from "lodash/get";
Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    projectFilters: projectFilters
  },
  state: {
    selectedGroup: {},
    selectedTask: null,
    showCategories: false,
    showTaskDetail: false,
    currentOrganizationId: 0,
    currentProjectId: 0,
    projectFeatures: [],
    windowTitle: "",
    notifyMessage: ''
  },
  getters: {
    hasProjectFeature: (state) => (feature) => {
      return state.projectFeatures && state.projectFeatures.find(feat => {
        return feat == feature
      }) ? true: false;
    }  
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
      let fullTitle = get(Meteor.settings, "public.seo.titlePrefix", "l'atelier");
      if (windowTitle) {
        let titleValue = typeof windowTitle === "function" ? windowTitle.call(this) : windowTitle;
        fullTitle = fullTitle + " - " + titleValue;
      }
      state.windowTitle = fullTitle;
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
      context.commit('projectFilters/clearSelectedLabels');
      Meteor.call("projects.loadFeatures", {projectId: projectId}, (error, result) => {
        context.commit("setProjectFeatures", result);
      })
      context.commit('updateCurrentProjectId', projectId);
    },
    reloadProjectFeatures (context, projectId) {
      Meteor.call("projects.loadFeatures", {projectId: projectId}, (error, result) => {
        context.commit("setProjectFeatures", result);
      })
    },
    setCurrentOrganizationId (context, organizationId) {
      context.commit('clearSelectedGroup');
      context.commit('updateCurrentOrganizationId', organizationId);
    },
    selectTask(context, task) {
      context.commit('selectTask', task);
    },
    showTaskDetail(context, showTaskDetail) {
      context.commit('updateShowTaskDetail', showTaskDetail);
    },
    setWindowTitle (context, windowTitle) {
      context.commit('updateWindowTitle', windowTitle);
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
