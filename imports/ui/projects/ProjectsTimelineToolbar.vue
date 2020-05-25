<template>
  <v-toolbar class="projects-timeline-toolbar" dense>
    <tooltip-button
      bottom
      icon="mdi-calendar-today"
      :tooltip="$t('Today')"
      @on="$emit('go-to-today')"
    />
    <v-divider vertical />
    <tooltip-button
      bottom
      icon="mdi-magnify"
      :tooltip="$t('Reset zoom')"
      @on="$emit('zoom-reset')"
    />
    <tooltip-button
      bottom
      icon="mdi-magnify-minus"
      :tooltip="$t('Zoom out')"
      @on="$emit('zoom-out')"
    />
    <tooltip-button
      bottom
      icon="mdi-magnify-plus"
      :tooltip="$t('Zoom in')"
      @on="$emit('zoom-in')"
    />
    <v-divider vertical />
    <project-groups
      v-if="showCategories"
      class="ml-3"
      display="autocomplete"
      :organization-id="organizationId"
    />
  </v-toolbar>
</template>
<script>
export default {
  props: {
    showCategories: {
      type: Boolean,
      default: false
    },
    organizationId: {
      type: String,
      default: null
    }
  }
}
</script>
<style scoped>
  .projects-timeline-toolbar {
    flex: 0;
  }
</style>