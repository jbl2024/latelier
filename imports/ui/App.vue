<template>
  <div class="page-container">
    <md-app>
    <md-app-toolbar class="md-primary main-toolbar">
      <md-button class="md-icon-button" @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title" v-show="currentProjectId == 0">l'atelier</span>
      <span class="md-title" v-show="project">{{ project.name}}</span>

      <div class="md-toolbar-section-end">
        <blaze-template id="login" template="loginButtons" class="md-xsmall-hide"></blaze-template>
      </div>
    </md-app-toolbar>


    <md-app-drawer :md-active.sync="showNavigation" md-permanent="clipped" v-show="!hideDrawer">
      <md-list v-if="currentProjectId === 0">
        <md-list-item :to="{ name: 'projects-page'}" @click="showNavigation = false">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">Projets</span>
        </md-list-item>

        <md-list-item :to="{ name: 'projects-timeline'}" @click="showNavigation = false">
          <md-icon>timeline</md-icon>
          <span class="md-list-item-text">Planning</span>
        </md-list-item>

        <md-list-item :to="{ name: 'admin'}" @click="showNavigation = false">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Paramètres</span>
        </md-list-item>

        <md-divider></md-divider>
      </md-list>

      <project-menu v-if="currentProjectId != 0" :projectId="currentProjectId"></project-menu>
      <project-groups v-if="showCategories"></project-groups>

    </md-app-drawer>
    <md-app-content class="main-content">
      <router-view></router-view>
    </md-app-content>
    </md-app>
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
    }
  },
  computed: {
    ...mapState(['showCategories', 'hideDrawer', 'currentProjectId'])
  },
  meteor: {
    project: {
      params () {
        return {
          id: this.currentProjectId
        };
      },
      deep: false,
      update ({id}) {
        return Projects.findOne({ _id: id}) || {};
      }
    }
  },
  methods: {
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