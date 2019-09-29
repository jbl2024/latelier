<template>
  <div>
    <v-app v-resize="onResizeApp">
      <select-background :active.sync="showSelectBackgroundDialog"></select-background>
      <task-history :taskId="selectedTask ? selectedTask._id : '0'" :active.sync="showTaskHistory"></task-history>

      <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" color="primary" dark app fixed clipped-right>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-show="$vuetify.breakpoint.mdAndDown"></v-app-bar-nav-icon>
        <v-toolbar-title
          style="width: 300px"
          v-show="currentProjectId == 0 && currentOrganizationId == 0"
        >
          <span class="title ml-12 mr-12">L'atelier</span>
        </v-toolbar-title>

        <organization-title
          v-if="currentProjectId == 0 && currentOrganizationId != 0"
          :organizationId="currentOrganizationId"
        ></organization-title>
        <dashboard-title v-if="showDashboardTitle"></dashboard-title>
        <project-title v-if="currentProjectId != 0" :projectId="currentProjectId"></project-title>
        <v-spacer></v-spacer>
        <template v-if="$vuetify.breakpoint.lgAndUp">{{ email }}</template>
        <v-avatar dark>
          <v-menu offset-y eager>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
              >
                <author-avatar small :user-id="currentUser" v-if="hasAvatar"></author-avatar>
                <v-icon v-if="!hasAvatar">mdi-account-circle</v-icon>
              </v-btn>
            </template>            
            <login-menu></login-menu>
          </v-menu>
        </v-avatar>
        <notification-button></notification-button>
      </v-app-bar>

      <v-hover open-delay="300" v-slot:default="{ hover }">
      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        v-model="drawer"
        fixed
        dark
        left
        width="270px"
        class="drawer"
        :mini-variant="!hover && !$vuetify.breakpoint.xs"
      >
        <div class="drawer-wrapper">
          <organization-menu
            v-if="currentOrganizationId != 0 && currentProjectId == 0"
            :organizationId="currentOrganizationId"
          ></organization-menu>
          <project-menu v-if="currentProjectId != 0" :organizationId="currentOrganizationId" :projectId="currentProjectId"></project-menu>
          <project-groups v-if="showCategories" :organizationId="currentOrganizationId"></project-groups>
          <login-menu></login-menu>
        </div>
      </v-navigation-drawer>
      </v-hover>

      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        v-model="showTaskDetail"
        class="elevation-16"
        fixed
        app
        right
        :width="600"
        stateless
      >
        <v-card>
          <task-detail :taskId="selectedTask ? selectedTask._id : '0'" :taskObject="selectedTask"></task-detail>
        </v-card>
      </v-navigation-drawer>



      <v-content class="main-content">
        <v-container class="page-container" fluid>
          <router-view></router-view>
        </v-container>
      </v-content>
      <v-snackbar v-model="showSnackbar" :timeout="timeout" bottom>
        {{ notifyMessage }}
        <v-btn icon text @click="showSnackbar = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-app>
  </div>
</template>

<script>
import { Session } from "meteor/session";
import { Projects } from "/imports/api/projects/projects.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      drawer: null,
      showSnackbar: false,
      timeout: 6000
    };
  },
  computed: {
    ...mapState([
      "showCategories",
      "showDashboardTitle",
      "currentProjectId",
      "currentOrganizationId",
      "notifyMessage",
      "selectedTask",
      "windowTitle"
    ]),
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
    showSelectBackgroundDialog: {
      get() {
        return this.$store.state.showSelectBackgroundDialog;
      },
      set(value) {
        this.$store.dispatch("showSelectBackgroundDialog", value);
      }
    },
    hasAvatar() {
      if (Meteor) {
        return this.currentUser && this.currentUser.profile && this.currentUser.profile.avatar;
      }
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
        this.$store.dispatch("notify", "");
      }
    },
    windowTitle(title) {
      document.title = title
    }
  },
  meteor: {
    isConnected() {
      if (Meteor) {
        return Meteor.userId();
      }
      return false;
    },
    email() {
      if (Meteor) {
        const user = Meteor.user();
        if (user) {
          return user.emails[0].address;
        }
      }
    },
    notificationsCount() {
      if (Meteor) {
        const user = Meteor.user();
        if (user && user.notifications) {
          return user.notifications.count;
        }
      }
    },
    currentUser() {
      if (Meteor) {
        return Meteor.user()
      }
    },
    
    $subscribe: {
      user: function() {
        return [];
      }
    }
  },
  methods: {
    onResizeApp() {
      const width = window.innerWidth;
      if (width >= 1264 && !this.drawer) {
        this.drawer = true;
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

/* .drawer .v-list .v-list-item {
  color: #aaa !important;
} */

.drawer .v-icon {
  color: gray;
}

.drawer .v-list a.v-list-item--active {
  color: white !important;
}

.drawer .theme--dark.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
  color: #aaa !important;
}


.drawer .v-list-item--active .v-icon {
  color: white !important;
}


@media (min-width: 961px) {
  .drawer {
    top: 64px !important;

  }
  .drawer-wrapper {
    position: relative;
    height: calc(100% + 64px);
  }
}

@media (min-width: 1265px) {
  .main-content {
    margin-left: 80px;
  }
}

@media (max-width: 960px) {
  .drawer {
    top: 48px;

  }
  .drawer-wrapper {
    position: relative;
    height: calc(100% + 42px);
  }
}

</style>