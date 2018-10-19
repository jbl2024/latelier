<template>
  <div class="page-container">
    <v-app>

    <v-toolbar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      color="blue darken-3"
      dark
      app
      fixed
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3" v-show="currentProjectId == 0 && currentOrganizationId == 0">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="title ml-3 mr-5">L'atelier</span>
      </v-toolbar-title>

      <organization-title v-if="currentProjectId == 0 && currentOrganizationId != 0" :organizationId="currentOrganizationId">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      </organization-title>
      <project-title v-if="currentProjectId != 0" :projectId="currentProjectId">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      </project-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>notifications</v-icon>
      </v-btn>
        <blaze-template id="login" template="loginButtons"></blaze-template>
    </v-toolbar>

    <v-navigation-drawer
          :clipped="$vuetify.breakpoint.lgAndUp"
          v-model="drawer"
          fixed
          app
    >
      <organization-menu v-if="currentOrganizationId != 0 && currentProjectId == 0" :organizationId="currentOrganizationId"></organization-menu>
      <project-menu v-if="currentProjectId != 0" :projectId="currentProjectId"></project-menu>
      <project-groups v-if="showCategories" :organizationId="currentOrganizationId"></project-groups>
    </v-navigation-drawer>

    <v-content class="main-content">
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
    </v-app>
  </div>
</template>

<script>
import {Session} from 'meteor/session';
import { Projects } from '/imports/api/projects/projects.js'
import { mapState } from 'vuex';

export default {
  data() {
    return {
      showNavigation: false,
      drawer: null
    }
  },
  computed: {
    ...mapState(['showCategories', 'hideDrawer', 'currentProjectId', 'currentOrganizationId'])
  }
}
</script>

<style>
  
  .search {
    width: 100%;
  }

  .md-content.main-content {
    padding: 0;
  }

  .main-content {
    padding: 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
  }

  .page-container {
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .md-app-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
    min-height: calc(100vh - 64px);
  }

  .md-app-container {
    height: calc(100vh - 64px);
    overflow-x: hidden;
    overflow-y: hidden;
  }

  @media (max-width: 600px) {
    .md-app-container {
      height: calc(100vh - 56px);
      overflow-x: hidden;
      overflow-y: hidden;
    }
  }
    
    
  .md-app-content .md-card {
    margin-right: 0;
    margin-left: 0;  
  }

  .md-app-drawer .md-list-item-text {
    font-size: 13px;
    font-weight: 500;
  }

</style>