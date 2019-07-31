<template>
  <div class>
    <v-app>
      <select-background :active.sync="showSelectBackgroundDialog"></select-background>
      <task-history :taskId="selectedTask ? selectedTask._id : '0'" :active.sync="showTaskHistory"></task-history>

      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="primary" dark app fixed clipped-right>
        <v-toolbar-side-icon @click.stop="drawer = !drawer" v-show="$vuetify.breakpoint.mdAndDown"></v-toolbar-side-icon>
        <v-toolbar-title
          style="width: 300px"
          class="ml-3 mr-5"
          v-show="currentProjectId == 0 && currentOrganizationId == 0"
        >
          <span class="title ml-3 mr-5">L'atelier</span>
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
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
              >
                <v-icon>account_circle</v-icon>
              </v-btn>
            </template>            
            <login-menu></login-menu>
          </v-menu>
        </v-avatar>
        <v-avatar dark v-if="isConnected">
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
              >
                <v-icon>notifications</v-icon>
              </v-btn>
            </template>            
            <notifications-menu></notifications-menu>
          </v-menu>
        </v-avatar>
      </v-toolbar>

      <v-hover open-delay="300">
      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        v-model="drawer"
        fixed
        dark
        slot-scope="{ hover }"
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
        <v-btn icon flat @click="showSnackbar = false">
          <v-icon>close</v-icon>
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
    $subscribe: {
      user: function() {
        return [];
      }
    }
  }
};
</script>

<style>
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

.drawer .v-list {
}

.drawer .v-list .v-list__tile {
  color: #aaa !important;
}

.drawer .v-icon {
  color: gray;
}

.drawer .v-list a.v-list__tile--active {
  color: white !important;
}

.drawer .v-list__tile--active .v-icon {
  color: white !important;
}


@media (min-width: 961px) {
  .drawer {
    top: 64px;
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

/* .drawer .drawer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  overflow-y: auto;
} */
.list__tile--active .list__tile__action,
.list__tile--active .list__tile__action .icon {
  color: white;
}
</style>