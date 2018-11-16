<template>
  <div class="">
    <v-app>

      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="primary" dark app fixed>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title style="width: 300px" class="ml-3 mr-5" v-show="currentProjectId == 0 && currentOrganizationId == 0">
          <span class="title ml-3 mr-5">L'atelier</span>
        </v-toolbar-title>

        <organization-title v-if="currentProjectId == 0 && currentOrganizationId != 0" :organizationId="currentOrganizationId">
        </organization-title>
        <project-title v-if="currentProjectId != 0" :projectId="currentProjectId">
        </project-title>
        <v-spacer></v-spacer>
        <v-btn icon class="show-desktop">
          <v-icon>apps</v-icon>
        </v-btn>
        <v-btn icon class="show-desktop">
          <v-icon>notifications</v-icon>
        </v-btn>
        <blaze-template class="show-desktop" id="login" template="loginButtons"></blaze-template>
      </v-toolbar>

      <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app class="drawer">
        <organization-menu v-if="currentOrganizationId != 0 && currentProjectId == 0" :organizationId="currentOrganizationId"></organization-menu>
        <project-menu v-if="currentProjectId != 0" :projectId="currentProjectId"></project-menu>
        <project-groups v-if="showCategories" :organizationId="currentOrganizationId"></project-groups>
        <login-menu></login-menu>
      </v-navigation-drawer>

      <v-content class="main-content">
        <v-container class="page-container" fluid>
          <router-view></router-view>          
        </v-container>
      </v-content>
      <v-snackbar
          v-model="showSnackbar"
          :timeout="timeout"
          bottom
      >
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
      "currentProjectId",
      "currentOrganizationId",
      "notifyMessage"
    ])
  },
  watch: {
    notifyMessage (message) {
      if (message) {
        this.showSnackbar = true;
      }
    },
    showSnackbar (show) {
      if (!show) {
        this.$store.dispatch("notify", "");
      }
    }
  }
};
</script>

<style>
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
  padding-left: 4px;
  padding-top: 4px;
  padding-right: 4px;
}

.drawer .v-list {
  padding-left: 8px;
}
</style>