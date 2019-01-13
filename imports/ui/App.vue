<template>
  <div class>
    <v-app>
    <select-background :active.sync="showSelectBackgroundDialog"></select-background>

      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="primary" dark app fixed>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
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
        <project-title v-if="currentProjectId != 0" :projectId="currentProjectId"></project-title>
        <v-spacer></v-spacer>
        {{ email }}
        <v-avatar dark>
          <v-menu offset-y>
            <v-btn icon slot="activator">
              <v-icon>account_circle</v-icon>
            </v-btn>
            <login-menu></login-menu>
            <v-divider></v-divider>
            <v-list>
              <v-list-tile @click="showSelectBackgroundDialog = true">
                <v-list-tile-title>Background</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-avatar>
      </v-toolbar>

      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        v-model="drawer"
        fixed
        app
        class="drawer"
      >
        <organization-menu
          v-if="currentOrganizationId != 0 && currentProjectId == 0"
          :organizationId="currentOrganizationId"
        ></organization-menu>
        <project-menu v-if="currentProjectId != 0" :projectId="currentProjectId"></project-menu>
        <project-groups v-if="showCategories" :organizationId="currentOrganizationId"></project-groups>
        <login-menu></login-menu>
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
      timeout: 6000,
      showSelectBackgroundDialog: false
    };
  },
  computed: {
    ...mapState([
      "showCategories",
      "currentProjectId",
      "currentOrganizationId",
      "notifyMessage"
    ])
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
    }
  },
  meteor: {
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
    },
  }
};
</script>

<style>
#app {
  font-family: "Roboto", sans-serif;
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
}

.drawer .v-list {
  padding-left: 8px;
}
</style>