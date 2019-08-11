<template>
  <div class="project-menu">
    <project-history :projectId="projectId" ref="projectHistory"></project-history>
    <project-trashcan :projectId="projectId" ref="projectTrashcan"></project-trashcan>

    <v-list class="pt-0" v-if="projectId">
      <v-list-item
        :to="{ name: 'project', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>list</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Tasks') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'project-bpmn', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>donut_large</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('BPMN') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'project-timeline', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>timeline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Planning') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'project-canvas', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>web</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Canvas') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'project-weather', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>wb_sunny</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Weather') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        :to="{ name: 'project-attachments-page', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>attachment</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Attachments') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="$refs.projectHistory.open()">
        <v-list-item-action>
          <v-icon>track_changes</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('History') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="$refs.projectTrashcan.open()">
        <v-list-item-action>
          <v-icon>delete</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Trashcan') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-if="canManageProject(projectId)"
        :to="{ name: 'project-settings', params: { projectId: projectId }}"
      >
        <v-list-item-action>
          <v-icon>settings</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Settings') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
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

