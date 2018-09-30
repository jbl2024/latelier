<template>

<div class="project-detail">

  <div if="project">
    <md-toolbar class="md-transparent" md-elevation="0">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="md-icon-button md-dense" @click="requestClose()">
            <md-icon>close</md-icon>
          </md-button>
          <router-link :to="{ name: 'project', params: { organizationId: project.organizationId, projectId: project._id }}">
            {{ project.name }}
          </router-link>
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

    <project-info :project="project" v-show="showInfo(project)"></project-info>

    <md-tabs md-sync-route md-alignment="fixed"  v-show="showSettings(project)">
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
    },

    showInfo (project) {
      if (project.createdBy === Meteor.userId()) {
        return false;
      }
      const members = project.members || [];
      return !members.some(member => {
        return member === Meteor.userId()
      });
    },

    showSettings (project) {
      if (project.createdBy === Meteor.userId()) {
        return true;
      }
      const members = project.members || [];
      return members.some(member => {
        return member == Meteor.userId()
      });
    }
  }
};
</script>

<style>
.vis-item .vis-item-overflow {
  overflow: visible;
}

.project-info {
  margin: 24px;
}

</style>