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
      <v-content class="main-content">
        <v-container class="page-container" fluid>
          <router-view />
        </v-container>
      </v-content>
      <template v-if="isConnected">
        <main-menu
          v-if="$vuetify.breakpoint.mdAndDown"
          display="bottom-navigation"
          :dark="isNavigationColorDark"
          :project="currentProject"
          :organization="currentOrganization"
        />
        <v-snackbar v-model="showSnackbar" :timeout="timeout" bottom>
          {{ notifyMessage }}
          <v-btn dark icon text @click="showSnackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-snackbar>
      </template>
    </v-app>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import TopBar from "./ui/TopBar";
import NavDrawer from "./ui/NavDrawer";
import DashboardTaskTabs from "/imports/ui/dashboard/common/DashboardTaskTabs";
import MainMenu from "/imports/ui/ui/MainMenu";

export default {
  components: {
    TopBar,
    NavDrawer,
    DashboardTaskTabs,
    MainMenu
  },
  data() {
    return {
      rightDrawerWidth: 600,
      openMenu: false,
      showSnackbar: false,
      timeout: 6000
    };
  },
  computed: {
    leftDrawerWidth() {
      return this.$vuetify.breakpoint.smAndDown ? "100%" : 360;
    },
    ...mapState([
      "currentUser",
      "notifyMessage",
      "selectedTask",
      "windowTitle"
    ]),
    ...mapState("organization", ["currentOrganizationId", "currentOrganization"]),
    ...mapState("project", ["currentProjectId", "currentProject"]),
    ...mapGetters("project", ["currentProjectColor"]),
    ...mapGetters(["isTaskDetailShown", "isConnected"]),
    ...mapGetters("ui", ["isNavigationColorDark"]),
    showLeftDrawer: {
      get() {
        return this.$store.state.showLeftDrawer;
      },
      set(value) {
        this.$store.dispatch("showLeftDrawer", value);
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
.v-content__wrap {
  height: 100%;
}

</style>
