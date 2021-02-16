import Vue from "vue";
import Vuex from "vuex";
import { Meteor } from "meteor/meteor";
import { Permissions } from "/imports/api/permissions/permissions";
import { UserUtils } from "/imports/api/users/utils";
import deepCopy from "/imports/ui/utils/deepCopy";

import get from "lodash/get";
import ui from "./modules/ui";
import project from "./modules/project";
import organization from "./modules/organization";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    ui,
    project,
    organization
  },
  state: {
    currentLocale: null,
    currentUserId: null,
    currentUser: null,
    isAdmin: false,
    selectedGroup: {},
    selectedTask: null,
    showSelectBackgroundDialog: false,
    showCategories: false,
    showTaskDetail: false,
    showTaskDetailFullscreen: false,
    showTaskHistory: false,
    showTaskExport: false,
    showDashboardTitle: false,
    dashboardFilter: "",
    windowTitle: "",
    notifyMessage: "",
    showMobileDrawer: false,
    showLabelText: false,
    storedRoutes: {}
  },
  getters: {
    isConnected: (state) => Boolean(state.currentUserId),
    isAdmin: (state) => state.isAdmin,
    currentUserEmail: (state) => state.currentUser ? UserUtils.getEmail(state.currentUser) : null,
    hasAvatar: (state) => state.currentUser ? UserUtils.hasAvatar(state.currentUser) : false,
    isTaskDetailShown: (state) => state.showTaskDetail === true
  },
  mutations: {
    updateCurrentLocale(state, locale) {
      state.currentLocale = locale;
    },
    updateCurrentUserId(state, currentUserId) {
      state.currentUserId = currentUserId;
    },
    updateCurrentUser(state, currentUser) {
      state.currentUser = currentUser;
    },
    updateIsAdmin(state, isAdmin) {
      state.isAdmin = isAdmin;
    },
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
    updateShowTaskDetailFullscreen(state, showTaskDetailFullscreen) {
      state.showTaskDetailFullscreen = showTaskDetailFullscreen;
    },
    updateShowTaskHistory(state, showTaskHistory) {
      state.showTaskHistory = showTaskHistory;
    },
    updateShowTaskExport(state, showTaskExport) {
      state.showTaskExport = showTaskExport;
    },
    updateShowDashboardTitle(state, showDashboardTitle) {
      state.showDashboardTitle = showDashboardTitle;
    },
    updateDashboardFilter(state, dashboardFilter) {
      state.dashboardFilter = dashboardFilter;
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
    },
    updateShowMobileDrawer(state, showMobileDrawer) {
      state.showMobileDrawer = showMobileDrawer;
    },
    updateStoredRoutes(state, storedRoutes) {
      state.storedRoutes = storedRoutes;
    }
  },
  actions: {
    setCurrentLocale(context, locale) {
      context.commit("updateCurrentLocale", locale);
    },
    setCurrentUserId(context, currentUserId) {
      context.commit("updateCurrentUserId", currentUserId);
    },
    setCurrentUser(context, currentUser) {
      try {
        if (!currentUser) {
          throw new Error("Invalid user");
        }
        context.commit("updateCurrentUser", currentUser);
        context.commit("updateCurrentUserId", currentUser._id);
        context.commit("updateIsAdmin", Permissions.isAdmin(currentUser._id));
      } catch (error) {
        context.commit("updateCurrentUser", null);
        context.commit("updateCurrentUserId", null);
        context.commit("updateIsAdmin", false);
      }
    },
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
    selectTask(context, task) {
      context.commit("selectTask", task);
    },
    showTaskDetail(context, showTaskDetail) {
      context.commit("updateShowTaskDetail", showTaskDetail);
    },
    showTaskDetailFullscreen(context, showTaskDetailFullscreen) {
      context.commit("updateShowTaskDetailFullscreen", showTaskDetailFullscreen);
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
    },
    showTaskExport(context, showTaskExport) {
      context.commit("updateShowTaskExport", showTaskExport);
    },
    storeRoute(context, { name, route }) {
      if (!name || !route) return;
      const storedRoutes = deepCopy(context.state.storedRoutes);
      storedRoutes[name] = route;
      context.commit("updateStoredRoutes", storedRoutes);
    }
  }
});
export default store;
