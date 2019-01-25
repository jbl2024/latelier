<template>

<div class="project-menu">
  <project-history :projectId="project._id" ref="projectHistory"></project-history>
  
  <v-list dense class="pt-0" v-if="$subReady.project">
    <v-list-tile :to="{ name: 'project', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>list</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Tâches</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="{ name: 'project-timeline', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>timeline</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Planning</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="{ name: 'project-canvas', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>web</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>{{ $t('Canvas') }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="{ name: 'project-weather', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>wb_sunny</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>{{ $t('Weather') }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="{ name: 'project-attachments-page', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>attachment</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Pièces jointes</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile @click="$refs.projectHistory.open()">
      <v-list-tile-action>
        <v-icon>track_changes</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Historique</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile :to="{ name: 'project-settings', params: { organizationId: project.organizationId, projectId: project._id }}">
      <v-list-tile-action>
        <v-icon>settings</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Paramètres</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
  <v-divider></v-divider>
  <labels :projectId="projectId"></labels>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  data() {
    return {
      showHistoryDialog: false
    };
  },
  meteor: {
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      }
    },
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
  }
};
</script>

<style scoped>

</style>