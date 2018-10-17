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
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down" v-show="currentProjectId == 0 && currentOrganizationId == 0">l'atelier</span>
        <organization-title v-if="currentProjectId == 0 && currentOrganizationId != 0" :organizationId="currentOrganizationId"></organization-title>
        <project-title v-if="currentProjectId != 0" :projectId="currentProjectId"></project-title>
        <blaze-template id="login" template="loginButtons" class="md-xsmall-hide"></blaze-template>
      </v-toolbar-title>          
    </v-toolbar>

    <v-navigation-drawer
          :clipped="$vuetify.breakpoint.lgAndUp"
          v-model="drawer"
          fixed
          app
    >
      <md-list v-if="currentOrganizationId != 0 && currentProjectId == 0">

        <md-list-item :to="{ name: 'projects-page', params: {organizationId: currentOrganizationId}}" @click="showNavigation = false">
          <md-icon>pages</md-icon>
          <span class="md-list-item-text">Projets</span>
        </md-list-item>

        <md-list-item :to="{ name: 'projects-timeline', params: {organizationId: currentOrganizationId}}" @click="showNavigation = false">
          <md-icon>timeline</md-icon>
          <span class="md-list-item-text">Planning</span>
        </md-list-item>

        <md-list-item :to="{ name: 'organization-resources-page', params: { organizationId: currentOrganizationId }}">
          <md-icon>category</md-icon>
          <span class="md-list-item-text">Ressources</span>
        </md-list-item>

        <md-list-item :to="{ name: 'organization-settings', params: { organizationId: currentOrganizationId }}">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Paramètres</span>
        </md-list-item>

        <md-divider></md-divider>
      </md-list>

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