<template>

<div class="project-detail">

  <div if="$subReady.project">
    <md-toolbar class="md-transparent" md-elevation="0">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="md-icon-button md-dense" @click="requestClose()">
            <md-icon>close</md-icon>
          </md-button>
          <span>{{ project.name}}</span>
        </div>
        <div class="md-toolbar-section-end">
          <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
            <md-button md-menu-trigger class="md-icon-button">
              <md-icon>more_vert</md-icon>
            </md-button>
            <md-menu-content>
            </md-menu-content>
          </md-menu>
        </div>
      </div>

    </md-toolbar>

    <md-divider></md-divider>

    <md-tabs md-sync-route md-alignment="fixed">
      <md-tab id="tab-general" md-label="Paramètres">
        <project-settings-general :project="project"></project-settings-general>
      </md-tab>

      <md-tab id="tab-users" md-label="Utilisateurs">
        <project-settings-manage-users :project="project" class="users"></project-settings-manage-users>
      </md-tab>
    </md-tabs> 
  </div>
</div>


</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import showdown from 'showdown';

export default {
  props: {
    projectId: {
      type: String
    }
  },
  data() {
    return {
      editDescription: false
    };
  },
  meteor: {
    project: {
      params () {
        return {
          id: this.projectId
        };
      },
      deep: false,
      update ({id}) {
        return Projects.findOne({ _id: id}) || {};
      }
    }
  },
  methods: {
    requestClose () {
      this.$events.fire('close-project-detail');
    }
  }
};
</script>

<style scoped>
</style>