<template>

<div class="organization-menu">
    <v-list dense class="pt-0">
      <v-list-tile :to="{ name: 'projects-page', params: {organizationId: organizationId}}" @click="showNavigation = false">
        <v-list-tile-action>
          <v-icon>pages</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Projets</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :to="{ name: 'projects-timeline', params: {organizationId: organizationId}}" @click="showNavigation = false">
        <v-list-tile-action>
          <v-icon>timeline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Planning</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :to="{ name: 'organization-resources-page', params: {organizationId: organizationId}}" @click="showNavigation = false">
        <v-list-tile-action>
          <v-icon>category</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Ressources</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :to="{ name: 'organization-settings', params: {organizationId: organizationId}}" @click="showNavigation = false">
        <v-list-tile-action>
          <v-icon>settings</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Parametres</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>
</div>

</template>

<script>
export default {
  props: {
    organizationId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  methods: {
  }
};
</script>

<style scoped>
</style>