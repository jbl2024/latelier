<template>
  <div class="project-menu" v-if="projectId">
    <v-tabs v-if="$vuetify.breakpoint.lgAndUp" :background-color="backgroundColor" hide-slider>
      <v-tab v-for="menuItem in menuItems" :to="menuItem.to" :key="menuItem.id">
        <v-icon>{{ menuItem.icon }}</v-icon>
        {{ menuItem.title }}
      </v-tab>
    </v-tabs>
    <template v-if="$vuetify.breakpoint.mdAndDown">
      <v-list class="pt-0">
        <v-list-item v-for="menuItem in menuItems" :to="menuItem.to" :key="menuItem.id">
          <v-list-item-action>
            <v-icon>{{ menuItem.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ menuItem.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    projectId: {
      type: String,
      default: null
    },
    backgroundColor: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    const menuItems = [
        // Project Dashboard
        {
          id: 'dashboard',
          title: this.$t('Dashboard'),
          icon: 'mdi-information-outline',
          to: {name: 'project-dashboard', params: {projectId: this.projectId}}
        },
        // Tasks
        {
          id: 'tasks',
          title: this.$t("Tasks"),
          icon: 'mdi-format-list-bulleted',
          to: {name: 'project', params: {projectId: this.projectId}}
        },
        // Planning
        {
          id: 'planning',
          title: this.$t('Planning'),
          icon: 'mdi-chart-timeline-variant',
          to: {name: 'project-timeline', params: {projectId: this.projectId}}
        },
        // Attachments
        {
          id: 'attachments',
          title: this.$t('Documents'),
          icon: 'mdi-attachment',
          to: {name: 'project-attachments-page', params: {projectId: this.projectId}}
        },
        // BPMN
        {
          id: 'bpmn',
          title: this.$t('BPMN'),
          icon: 'mdi-chart-donut',
          to: {name: 'project-bpmn', params: {projectId: this.projectId}}
        },
        // Canvas
        {
          id: 'canvas',
          title: this.$t('Canvas'),
          icon: 'mdi-file-document-box-check',
          to: {name: 'project-canvas', params: {projectId: this.projectId}}
        },
        // Weather
        {
          id: 'weather',
          title: this.$t('Weather'),
          icon: 'mdi-white-balance-sunny',
          to: {name: 'project-weather', params: {projectId: this.projectId}}
        },
    ];
    return {
      menuItems,
      showHistoryDialog: false
    };
  }
};
</script>
<style>
  .project-menu {
    height: 100%;
  }
  .project-menu .v-tabs .v-icon {
    color: inherit;
    padding-right: 0.5rem;
  }
  .project-menu .v-tabs,
  .project-menu .v-tabs > .v-tabs-bar {
    height: 100%;
  }
  .project-menu .v-tabs .v-tab {
    font-size: 0.8rem;
    padding: 0 0.75rem;
  }
</style>