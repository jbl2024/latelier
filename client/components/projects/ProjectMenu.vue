<template>
  <div class="project-menu">
    <project-history :projectId="projectId" ref="projectHistory"></project-history>
    <project-trashcan :projectId="projectId" ref="projectTrashcan"></project-trashcan>

    <v-list dense class="pt-0" v-if="projectId">
      <v-list-tile
        :to="{ name: 'project', params: { projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>list</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Tâches</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-bpmn', params: { projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>donut_large</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>BPMN</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-timeline', params: { projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>timeline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Planning</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-canvas', params: { projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>web</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Canvas') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-weather', params: { projectId: projectId }}"
      >
        <v-list-tile-action>
          <v-icon>wb_sunny</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Weather') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        :to="{ name: 'project-attachments-page', params: { projectId: projectId }}"
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
      <v-list-tile @click="$refs.projectTrashcan.open()">
        <v-list-tile-action>
          <v-icon>delete</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Trashcan') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        v-if="canManageProject(projectId)"
        :to="{ name: 'project-settings', params: { projectId: projectId }}"
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
import { Permissions } from "/imports/api/permissions/permissions"

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
  methods: {
    canManageProject(projectId) {
      return Permissions.isAdmin(Meteor.userId(), projectId) || Permissions.isAdmin(Meteor.userId());
    }
  },
};
</script>

