<template>
  <div class="project-menu">
    <project-history :projectId="projectId" ref="projectHistory"></project-history>

    <v-list dense class="pt-0" v-if="projectId && organizationId">
      <v-list-tile
        :to="{ name: 'project', params: { organizationId: organizationId, projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>list</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Tâches</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-timeline', params: { organizationId: organizationId, projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>timeline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Planning</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-canvas', params: { organizationId: organizationId, projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>web</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Canvas') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-weather', params: { organizationId: organizationId, projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>wb_sunny</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Weather') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-attachments-page', params: { organizationId: organizationId, projectId: projectId }}"
      >
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
      <v-list-tile
        :to="{ name: 'project-settings', params: { organizationId: organizationId, projectId: projectId }}"
      >
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
export default {
  props: {
    projectId: {
      type: String,
      default: 0
    },
    organizationId: {
      type: String,
      default: 0
    }
  },
  data() {
    return {
      showHistoryDialog: false
    };
  }
};
</script>

