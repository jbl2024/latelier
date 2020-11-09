<template>
  <div>
    <v-app>
      <template v-if="isConnected">
        <v-navigation-drawer
          v-if="hasLeftDrawer"
          id="left-drawer"
          v-model="showLeftDrawer"
          :width="leftDrawerWidth"
          app
          clipped
        >
          <dashboard-tabs
            v-if="currentUser"
            :user="currentUser"
            :project="currentProject"
            :organization="currentOrganization"
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
        <top-bar :dense="false" />
        <v-navigation-drawer
          id="right-drawer"
          v-model="showTaskDetail"
          class="elevation-16"
          fixed
          right
          :width="rightDrawerWidth"
        >
          <task-detail
            :key="showTaskDetail"
            :task-id="selectedTask ? selectedTask._id : '0'"
            :task-object="selectedTask"
          />
        </v-navigation-drawer>
      </template>
      <v-main class="main-content">
        <v-container class="page-container" fluid>
          <router-view />
        </v-container>
      </v-main>
      <template v-if="isConnected">
        <main-menu
          v-if="$vuetify.breakpoint.mdAndDown"
          display="bottom-navigation"
          :dark="isNavigationColorDark"
          :project="currentProject"
          :organization="currentOrganization"
        />
      </template>
      <v-snackbar v-model="showSnackbar" :timeout="timeout" bottom app>
        {{ notifyMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn dark icon text v-bind="attrs" @click="showSnackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-app>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import TopBar from "./ui/TopBar";
import NavDrawer from "./ui/NavDrawer";
import DashboardTabs from "/imports/ui/dashboard/common/DashboardTabs";
import MainMenu from "/imports/ui/ui/MainMenu";

export default {
  components: {
    TopBar,
    NavDrawer,
    DashboardTabs,
    MainMenu
  },
  data() {
    return {
      openMenu: false,
      showSnackbar: false,
      timeout: 6000
    };
  },
  computed: {
    rightDrawerWidth() {
      if (this.showTaskDetailFullscreen) {
        return "100%";
      }
      return 600;
    },
    leftDrawerWidth() {
      return this.$vuetify.breakpoint.smAndDown ? "100%" : 360;
    },
    ...mapState([
      "currentUser",
      "notifyMessage",
      "selectedTask",
      "windowTitle",
      "showTaskDetailFullscreen"
    ]),
    ...mapState("organization", ["currentOrganizationId", "currentOrganization"]),
    ...mapState("project", ["currentProjectId", "currentProject"]),
    ...mapGetters("project", ["currentProjectColor"]),
    ...mapGetters(["isTaskDetailShown", "isConnected"]),
    ...mapGetters("ui", ["isNavigationColorDark"]),
    showLeftDrawer: {
      get() {
        return this.$store.state.ui.leftDrawer.showLeftDrawer;
      },
      set(value) {
        this.$store.dispatch("ui/leftDrawer/showLeftDrawer", value);
      }
    },
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
      return Boolean(["home", "dashboard-page", "dashboard-organization-page", "project-dashboard"].includes(routeName));
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
    },
    currentProjectColor: {
      immediate: true,
      handler(newVal) {
        if (newVal != null) {
          this.$store.dispatch("ui/setNavigationColor", newVal);
        } else {
          this.$store.dispatch("ui/resetNavigationColor");
        }
      }
    }
  },
  created() {
    this.$store.dispatch("setCurrentLocale", this.$i18n.locale);
    this.$store.dispatch("ui/setNavigationColor", this.$vuetify.theme.currentTheme.primary);
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
    user() {
      const user = Meteor.user();
      this.$store.dispatch("setCurrentUser", user);

      const isLoggingIn = Meteor.loggingIn() || this.$isLoggingIn;
      const authRequiredForCurrentRoute = !this.$router.currentRoute.meta.anonymous;
      const isAuthenticated = user;

      if (isLoggingIn) {
        return;
      }

      if (isAuthenticated && !authRequiredForCurrentRoute) {
        this.$router.push({ name: "home" });
      }

      if (!isAuthenticated && authRequiredForCurrentRoute) {
        this.$router.push({ name: "login" });
      }
    }
  },
  methods: {
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
/* app theme */
#app {
  background-color: #e5e5e5;
  font-family: 'Inter', sans-serif;
}

#right-drawer {
  z-index: 9;
}

#right-drawer .v-navigation-drawer__content {
  height: -webkit-fill-available;
}

.v-application .headline, .v-application .title {
  font-family: 'Inter', sans-serif !important;
}

.search {
  width: 100%;
}

.v-list--dense .v-list-item .v-list-item__title {
  font-size: 1rem;
}

.sticky,
.sticky-tabs .v-tabs-bar {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 2;
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
  padding: 0;
}

/* fix for safari : all parents must have height defined for height:100% to work */
.v-main__wrap {
  height: 100%;
}

</style>
