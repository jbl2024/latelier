<template>
  <div>
    <v-app v-resize="onResizeApp">
      <template v-if="isConnected">
        <v-navigation-drawer
          v-if="hasLeftDrawer && $vuetify.breakpoint.lgAndUp"
          v-model="leftDrawer"
          width="360"
          app
          clipped
        >
          <dashboard-task-tabs
            v-if="currentUser"
            :user="currentUser"
            :project-id="currentProjectId"
            :organization-id="currentOrganizationId"
          />
        </v-navigation-drawer>
        <nav-drawer v-show="$vuetify.breakpoint.mdAndDown" />
      </template>
      <select-background v-model="showSelectBackgroundDialog" />
      <template v-if="isConnected">
        <task-history
          v-model="showTaskHistory"
          :task-id="selectedTask ? selectedTask._id : '0'"
        />
        <task-export
          v-model="showTaskExport"
          :task-id="selectedTask ? selectedTask._id : '0'"
        />
        <top-bar />
        <v-navigation-drawer
          v-model="showTaskDetail"
          class="elevation-16"
          fixed
          right
          :width="600"
        >
          <task-detail
            :key="showTaskDetail"
            :task-id="selectedTask ? selectedTask._id : '0'"
            :task-object="selectedTask"
          />
        </v-navigation-drawer>
      </template>
      <v-content class="main-content">
        <v-container class="page-container" fluid>
          <router-view :key="$route.fullPath" />
        </v-container>
      </v-content>
      <v-snackbar v-model="showSnackbar" :timeout="timeout" bottom>
        {{ notifyMessage }}
        <v-btn dark icon text @click="showSnackbar = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-app>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import TopBar from "./ui/TopBar";
import NavDrawer from "./ui/NavDrawer";
import DashboardTaskTabs from "/imports/ui/dashboard/common/DashboardTaskTabs";

export default {
  components: {
    TopBar,
    NavDrawer,
    DashboardTaskTabs
  },
  data() {
    return {
      leftDrawer: null,
      openMenu: false,
      showSnackbar: false,
      timeout: 6000
    };
  },
  computed: {
    ...mapState([
      "currentUser",
      "currentOrganizationId",
      "notifyMessage",
      "selectedTask",
      "windowTitle"
    ]),
    ...mapState("project", ["currentProjectId"]),
    ...mapGetters(["isConnected"]),
    showTaskDetail: {
      get() {
        return this.$store.state.showTaskDetail;
      },
      set(value) {
        this.$store.dispatch("showTaskDetail", value);
      }
    },
    showTaskHistory: {
      get() {
        return this.$store.state.showTaskHistory;
      },
      set(value) {
        this.$store.dispatch("showTaskHistory", value);
      }
    },
    showTaskExport: {
      get() {
        return this.$store.state.showTaskExport;
      },
      set(value) {
        this.$store.dispatch("showTaskExport", value);
      }
    },
    showSelectBackgroundDialog: {
      get() {
        return this.$store.state.showSelectBackgroundDialog;
      },
      set(value) {
        this.$store.dispatch("showSelectBackgroundDialog", value);
      }
    },
    hasLeftDrawer() {
      const routeName = this.$route?.name;
      return Boolean(["dashboard-organization-page", "project-dashboard"].includes(routeName));
    }
  },
  watch: {
    notifyMessage(message) {
      if (message) {
        this.showSnackbar = true;
      }
    },
    showSnackbar(show) {
      if (!show) {
        this.$notify("");
      }
    },
    windowTitle(title) {
      document.title = title;
    }
  },
  mounted() {
    const that = this;
    window.addEventListener("keyup", (event) => {
      that.onKeyup(event);
    });
  },
  meteor: {
    $subscribe: {
      user() {
        return [];
      }
    },
    userId() {
      const userId = Meteor.userId();
      if (!userId) {
        this.$store.dispatch("setCurrentUser", null);
        this.$router.push({ name: "login" });
      }
    },
    user() {
      const user = Meteor.user();
      if (user) {
        this.$store.dispatch("setCurrentUser", user);
      }
    }
  },
  methods: {
    onResizeApp() {
      const width = window.innerWidth;
      if (width >= 1264 && !this.drawer) {
        this.drawer = true;
      }
    },
    onKeyup(event) {
      const targetIsEditable = (target) => {
        if (!target) {
          return false;
        }
        const name = target.tagName.toLowerCase();
        if (name === "textarea") return true;
        if (name === "input") {
          const notTextual = [
            "button",
            "checkbox",
            "hidden",
            "image",
            "radio",
            "reset",
            "submit"
          ];
          return !notTextual.includes(target.type.toLowerCase());
        }
        if (target.contentEditable === "true") return true;
        return false;
      };

      if (targetIsEditable(event.target)) {
        return;
      }

      if (event.key === "m") {
        this.openMenu = !this.openMenu;
        if (this.openMenu) {
          this.$nextTick(() => {
            if (this.$refs.menu) {
              this.$refs.menu.getElementsByTagName("a")[0].focus();
            }
          });
        }
      }
    }
  }
};
</script>

<style>
/* override vuetify default theme */
html {
  font-size: 14px;
}

.v-btn--fab.v-size--default {
  height: 42px;
  width: 42px;
}

/* colors for main drawer (left): labels are set to white when activated */
.list-item--active .list-item__action,
.list-item--active .list-item__action .icon {
  color: white;
}

/* app theme */
#app {
  background-color: #e5e5e5;
}
.search {
  width: 100%;
}

.main-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  min-height: 0;
  flex: 1;
}

.page-container {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0;
  padding-left: 0px;
  padding-top: 0px;
  padding-right: 0px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  flex: 1;
}

.drawer .v-icon {
  color: gray;
}

.drawer .v-list a.v-list-item--active {
  color: white !important;
}

.drawer
  .theme--dark.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
  color: #aaa !important;
}

.drawer .v-list-item--active .v-icon {
  color: white !important;
}

.sticky-tabs .v-tabs-bar {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 2;
}

</style>
