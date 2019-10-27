<template>
  <div class="organization-menu">
    <v-list dense class="pt-0">
      <v-list-item
        :to="{
          name: 'projects-page',
          params: { organizationId: organizationId }
        }"
        @click="showNavigation = false"
      >
        <v-list-item-action>
          <v-icon>mdi-google-pages</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Projets</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'projects-timeline',
          params: { organizationId: organizationId }
        }"
        @click="showNavigation = false"
      >
        <v-list-item-action>
          <v-icon>mdi-chart-timeline-variant</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Planning</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'organization-settings',
          params: { organizationId: organizationId }
        }"
        @click="showNavigation = false"
      >
        <v-list-item-action>
          <v-icon>mdi-settings</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Parametres</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider />
  </div>
</template>

<script>
export default {
  props: {
    organizationId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped></style>
