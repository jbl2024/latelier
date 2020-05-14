<template>
  <div v-if="menuItems && menuItems.length" class="main-menu">
    <v-tabs
      v-if="computedDisplay === 'tabs'"
      hide-slider
      :class="{ radius: radius }"
    >
      <v-tab v-for="menuItem in menuItems" :key="menuItem.id" :to="menuItem.to">
        <v-icon>{{ menuItem.icon }}</v-icon>
        {{ menuItem.title }}
      </v-tab>
    </v-tabs>
    <template v-else-if="computedDisplay === 'list'">
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
    organization: {
      type: Object,
      default: null
    },
    radius: {
      type: Boolean,
      default: false
    },
    display: {
      type: String,
      default: null,
      validator: (display) => ["list", "tabs"].includes(display)
    }
  },
  computed: {
    computedDisplay() {
      if (this.display != null) return this.display;
      if (this.$vuetify.breakpoint.mdAndDown) return "list";
      if (this.$vuetify.breakpoint.lgAndUp) return "tabs";
    },
    organizationId() {
      if (!this.organization) return null;
      return this.organization._id;
    },
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    menuItems() {
      if (this.projectId !== null) {
        return this.projectMenuItems;
      } else if (this.organizationId !== null) {
        return this.organizationMenuItems;
      } else {
        return [];
      }
    },
    organizationMenuItems() {
      const menuItems = [
        {
          id: "projects",
          title: "Projets",
          icon: "mdi-google-pages",
          to: {
            name: "projects-page",
            params: { organizationId: this.organizationId }
          }
        },
        {
          id: "projects-timeline",
          title: "Planning",
          icon: "mdi-chart-timeline-variant",
          to: {
            name: "projects-timeline",
            params: { organizationId: this.organizationId }
          }
        },
        {
          id: "organization-settings",
          title: "Paramètres",
          icon: "mdi-settings",
          to: {
            name: "organization-settings",
            params: { organizationId: this.organizationId }
          }
        }
      ];
      return menuItems;
    },
    projectMenuItems() {
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

.main-menu {
  @include tabs-menu;
}
</style>
