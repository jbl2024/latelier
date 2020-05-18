<template>
  <div v-if="computedDisplay && menuItems && menuItems.length" class="main-menu">
    <!-- Display as tabs for top bar navigation -->
    <v-tabs
      v-if="computedDisplay === 'tabs'"
      dark
      hide-slider
      :class="{ radius: radius }"
    >
      <v-tab v-for="menuItem in menuItems" :key="menuItem.id" :to="menuItem.to">
        <v-icon>{{ menuItem.icon }}</v-icon>
        <span v-if="!onlyIcons">{{ menuItem.title }}</span>
      </v-tab>
    </v-tabs>
    <!-- Display as list for drawer navigation or menu like ProjectDetail.vue -->
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
    <!-- Display as Bottom Navigation used for mobile layout -->
    <v-bottom-navigation
      v-else-if="computedDisplay === 'bottom-navigation'"
      v-show="$vuetify.breakpoint.smAndDown"
      :value="true"
      app
      grow
      dark
      :background-color="navigationColor"
    >
      <v-btn :key="homeMenuItem.id" :value="homeMenuItem.id" :to="homeMenuItem.to">
        <span v-if="!onlyIcons">
          {{ homeMenuItem.title }}
        </span>
        <v-icon>{{ homeMenuItem.icon }} </v-icon>
      </v-btn>
      <v-btn
        v-for="menuItem in mobileMenuItems"
        :key="menuItem.id"
        :value="menuItem.id"
        :to="menuItem.to"
        exact
      >
        <span v-if="!onlyIcons">{{ menuItem.title }}</span>
        <v-icon>{{ menuItem.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { mapState } from "vuex";

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
      validator: (display) => ["list", "tabs", "bottom-navigation"].includes(display)
    },
    onlyIcons: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      homeMenuItem: {
        id: "dashboard-page",
        title: this.$t("Home"),
        icon: "mdi-home",
        to: { name: "dashboard-page" }
      }
    };
  },
  computed: {
    ...mapState("ui", ["navigationColor"]),
    computedDisplay() {
      if (this.display != null) return this.display;
      if (this.$vuetify.breakpoint.mdAndDown) return "list";
      if (this.$vuetify.breakpoint.lgAndUp) return "tabs";
      return null;
    },
    organizationId() {
      if (!this.organization) return null;
      return this.organization._id;
    },
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    mobileMenuItems() {
      return this.menuItems.filter((item) => item.meta && item.meta.mobile === true);
    },
    menuItems() {
      if (this.projectId !== null) {
        return this.projectMenuItems;
      } if (this.organizationId !== null) {
        return this.organizationMenuItems;
      }
      return this.homeMenuItems;
    },
    homeMenuItems() {
      const menuItems = [
        this.homeMenuItem
      ];
      return menuItems;
    },
    organizationMenuItems() {
      const menuItems = [
        {
          id: "dashboard",
          title: this.$t("Activity"),
          icon: "mdi-pulse",
          to: {
            name: "dashboard-organization-page",
            params: { organizationId: this.organizationId }
          },
          meta: {
            mobile: true
          }
        },
        {
          id: "projects-timeline",
          title: "Planning",
          icon: "mdi-chart-timeline-variant",
          to: {
            name: "projects-timeline",
            params: { organizationId: this.organizationId }
          },
          meta: {
            mobile: true
          }
        },
        {
          id: "organization-settings",
          title: "Paramètres",
          icon: "mdi-settings",
          to: {
            name: "organization-settings",
            params: { organizationId: this.organizationId }
          },
          meta: {
            mobile: true
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
          },
          meta: {
            mobile: true
          }
        },
        // Tasks
        {
          id: "tasks",
          title: this.$t("Tasks"),
          icon: "mdi-format-list-bulleted",
          to: { name: "project", params: { projectId: this.projectId } },
          meta: {
            mobile: true
          }
        },
        // Planning
        {
          id: "planning",
          title: this.$t("Planning"),
          icon: "mdi-chart-timeline-variant",
          to: {
            name: "project-timeline",
            params: { projectId: this.projectId }
          },
          meta: {
            mobile: true
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
          },
          meta: {
            mobile: true
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
