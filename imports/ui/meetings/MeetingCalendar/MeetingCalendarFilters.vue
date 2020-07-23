<template>
  <v-card class="meeting-calendar-filters">
    <v-card-text>
      <template v-if="hasProjects">
        <v-checkbox
          v-for="project in projects"
          :key="project._id"
          v-model="selected"
          :value="project._id"
          :color="project.color ? project.color : 'accent'"
          :label="project.name"
          hide-details
        />
      </template>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    projects: {
      type: Array,
      default() {
        return [];
      }
    },
    selectedProjects: {
      type: Array,
      default: null
    }
  },
  computed: {
    hasProjects() {
      return this.projects && Array.isArray(this.projects) && this.projects.length;
    },
    selected: {
      get() {
        return this.selectedProjects;
      },
      set(newSelectedProjects) {
        this.$emit("update:selected-projects", newSelectedProjects);
      }
    }
  }
};
</script>
<style lang="scss">
  .meeting-calendar-filters {
    &.v-card:not(.v-sheet--tile):not(.v-card--shaped) {
      border-radius: 9px;
    }
    background-color: white;
    .v-input--selection-controls {
      margin-top: 0;
      padding: 8px 4px;
    }
  }

</style>
