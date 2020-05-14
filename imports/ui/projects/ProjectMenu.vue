<template>
  <div v-if="projectId" class="project-menu">
    <v-tabs
      v-if="displayAsTabs"
      :background-color="backgroundColor"
      hide-slider
      :class="{ radius: radius }"
    >
      <v-tab v-for="menuItem in menuItems" :key="menuItem.id" :to="menuItem.to">
        <v-icon>{{ menuItem.icon }}</v-icon>
        {{ menuItem.title }}
      </v-tab>
    </v-tabs>
    <template v-if="displayAsList">
      <v-list class="pt-0">
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.id"
          :to="menuItem.to"
        >
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
    project: {
      type: Object,
      default: null
    },
    backgroundColor: {
      type: String,
      default: "primary"
    },
    radius: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayAsList() {
      return this.$vuetify.breakpoint.mdAndDown;
    },
    displayAsTabs() {
      return this.$vuetify.breakpoint.lgAndUp;
    },
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    menuItems() {
      const menuItems = [
        // Project Dashboard
        {
          id: "dashboard",
          title: this.$t("Activity"),
          icon: "mdi-pulse",
          to: {
            name: "project-dashboard",
            params: { projectId: this.projectId }
          }
        },
        // Tasks
        {
          id: "tasks",
          title: this.$t("Tasks"),
          icon: "mdi-format-list-bulleted",
          to: { name: "project", params: { projectId: this.projectId } }
        },
        // Planning
        {
          id: "planning",
          title: this.$t("Planning"),
          icon: "mdi-chart-timeline-variant",
          to: {
            name: "project-timeline",
            params: { projectId: this.projectId }
          }
        },
        // Attachments
        {
          id: "attachments",
          title: this.$t("Attachments"),
          icon: "mdi-attachment",
          to: {
            name: "project-attachments-page",
            params: { projectId: this.projectId }
          }
        },
        // BPMN
        {
          id: "bpmn",
          title: this.$t("BPMN"),
          icon: "mdi-chart-donut",
          to: { name: "project-bpmn", params: { projectId: this.projectId } }
        },
        // Canvas
        {
          id: "canvas",
          title: this.$t("Canvas"),
          icon: "mdi-file-document-box-check",
          to: { name: "project-canvas", params: { projectId: this.projectId } }
        },
        // Weather
        {
          id: "weather",
          title: this.$t("Weather"),
          icon: "mdi-white-balance-sunny",
          to: {
            name: "project-weather",
            params: { projectId: this.projectId }
          }
        }
      ];
      return menuItems;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "/imports/ui/styles/mixins/tabs-menu";

.project-menu {
  @include tabs-menu;
}
</style>
