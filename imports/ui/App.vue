<template>
  <div class="page-container">
    <md-toolbar class="md-primary main-toolbar">
      <md-button class="md-icon-button" @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">l'atelier</span>

      <div class="md-toolbar-section-end">
        <blaze-template id="login" template="loginButtons" class="md-xsmall-hide"></blaze-template>
        <md-button @click="showSidepanel = true">Favorites</md-button>
      </div>
    </md-toolbar>

    <md-drawer :md-active.sync="showNavigation">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">l'atelier</span>
      </md-toolbar>

      <md-list>
        <md-list-item :to="{ name: 'projects'}" @click="showNavigation = false">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">Accueil</span>
        </md-list-item>

        <md-list-item :to="{ name: 'projects-timeline'}" @click="showNavigation = false">
          <md-icon>timeline</md-icon>
          <span class="md-list-item-text">Timeline</span>
        </md-list-item>

        <md-list-item :to="{ name: 'admin'}" @click="showNavigation = false">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Paramètres</span>
        </md-list-item>
      </md-list>
    </md-drawer>

    <md-drawer class="md-right" :md-active.sync="showSidepanel">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">Favorites</span>
      </md-toolbar>

      <md-list>
        <md-list-item>
          <span class="md-list-item-text">Abbey Christansen</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon class="md-primary">chat_bubble</md-icon>
          </md-button>
        </md-list-item>

        <md-list-item>
          <span class="md-list-item-text">Alex Nelson</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon class="md-primary">chat_bubble</md-icon>
          </md-button>
        </md-list-item>

        <md-list-item>
          <span class="md-list-item-text">Mary Johnson</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon>chat_bubble</md-icon>
          </md-button>
        </md-list-item>
      </md-list>
    </md-drawer>

    <md-content class="main-content">
      <router-view></router-view>
    </md-content>

  </div>
</template>

<script>
import {Session} from 'meteor/session';
export default {
  data() {
    return {
      showNavigation: false,
      showSidepanel: false
    }
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

<style lang="scss" scoped>
  
  .search {
    width: 100%;
  }

  .md-content.main-content {
    padding: 0;
  }

  .main-content {
    background-color: #eee !important;
    padding: 16px;
    overflow-y: scroll;
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

  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }


  .md-app-content .md-card {
    margin-right: 0;
    margin-left: 0;  
  }

</style>