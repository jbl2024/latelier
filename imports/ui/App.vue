<template>
  <div class="page-container">
    <md-app>
    <md-app-toolbar class="md-primary main-toolbar">
      <md-button class="md-icon-button" @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">l'atelier</span>

      <div class="md-toolbar-section-end">
        <blaze-template id="login" template="loginButtons" class="md-xsmall-hide"></blaze-template>
      </div>
    </md-app-toolbar>

    <md-app-drawer :md-active.sync="showNavigation" md-permanent="clipped" v-if="!hideDrawer">

      <md-list>
        <md-list-item :to="{ name: 'projects-page'}" @click="showNavigation = false">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">Accueil</span>
        </md-list-item>

        <md-list-item :to="{ name: 'projects-timeline'}" @click="showNavigation = false">
          <md-icon>timeline</md-icon>
          <span class="md-list-item-text">Planification</span>
        </md-list-item>

        <md-list-item :to="{ name: 'admin'}" @click="showNavigation = false">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Paramètres</span>
        </md-list-item>

        <md-divider></md-divider>
      </md-list>
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
import { mapState } from 'vuex';

export default {
  data() {
    return {
      showNavigation: false,
    }
  },
  computed: {
    ...mapState(['showCategories', 'hideDrawer'])
  },
  meteor: {
    data: {
      count() {
        return Session.get('counter');
      }
    }
  },
  methods: {
    addOne() {
      Session.set('counter', this.count + 1);
      this.buttonLabel = labels[Math.round(Math.random()*(labels.length - 1))];
    }
  }
}
</script>

<style lang="scss">
  
  .search {
    width: 100%;
  }

  .md-content.main-content {
    padding: 0;
  }

  .main-content {
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .page-container {
    height: 100%;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(#000, .12);
    display: flex;
    flex-direction: column;
  }

  .md-app-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
    min-height: calc(100vh - 64px);
  }

  .md-app-container {
    overflow-x: hidden;
    overflow-y: hidden;
  }
    
  .md-app-content .md-card {
    margin-right: 0;
    margin-left: 0;  
  }

</style>