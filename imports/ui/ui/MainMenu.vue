<template>
  <div v-if="display && menuItems && menuItems.length" class="main-menu">
    <!-- Display as custom tabs made from v-list for top bar navigation -->
    <v-list
      v-if="display === 'tabs'"
      :light="!dark"
      :dark="dark"
      class="main-menu-tabs"
      :class="tabsClasses"
      hide-slider
    >
      <v-list-item
        v-for="menuItem in menuItems"
        :key="menuItem.id"
        :to="menuItem.to"
      >
        <div class="tabs__item-content">
          <v-icon class="tabs__icon">{{ menuItem.icon }}</v-icon>
          <v-list-item-title>{{ menuItem.title }}</v-list-item-title>
        </div>
      </v-list-item>
    </v-list>
    <!-- Display as list for drawer navigation or menu like ProjectDetail.vue -->
    <template v-else-if="display === 'list'">
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
      v-else-if="display === 'bottom-navigation'"
      :value="true"
      app
      grow
      fixed
      :light="!dark"
      :dark="dark"
      :background-color="navigationColor"
    >
      <v-btn
        v-for="menuItem in menuItems"
        :key="menuItem.id"
        :value="menuItem.id"
        :to="menuItem.to"
        exact
        @click="handleOnClick(menuItem)"
      >
        <span v-if="!onlyIcons">{{ menuItem.title }}</span>
        <v-icon>{{ menuItem.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";
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
    dark: {
      type: Boolean,
      default: false
    },
    radius: {
      type: Boolean,
      default: false
    },
    display: {
      type: String,
      required: true,
      validator: (display) => ["list", "tabs", "bottom-navigation"].includes(display)
    },
    onlyIcons: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tabsClasses() {
      return [
        this.radius ? "radius" : null,
        this.$vuetify.breakpoint.width < 1368 ? "dense" : null
      ];
    },
    ...mapState("ui", ["navigationColor"]),
    organizationId() {
      if (!this.organization) return null;
      return this.organization._id;
    },
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    menuItems() {
      let menuItems = [];
      if (this.projectId !== null) {
        menuItems = this.projectMenuItems;
      }
      if (this.organizationId !== null && !this.projectId) {
        menuItems = this.organizationMenuItems;
      }
      if (this.projectId == null && this.organizationId == null) {
        menuItems = this.homeMenuItems;
      }
      return menuItems.filter((item) => item.isActive == null || item.isActive);
    },
    homeMenuItems() {
      const menuItems = [
        {
          id: "dashboard-page",
          title: this.$t("Home"),
          icon: "mdi-home",
          to: { name: "dashboard-page" }
        },
        {
          id: "tasks-drawer",
          title: this.$t("Tasks"),
          icon: "mdi-format-list-bulleted",
          onClick: () => {
            this.$store.dispatch("showLeftDrawer", true);
          }
        }
      ];
      return menuItems;
    },
    organizationMenuItems() {
      const menuItems = [
        {
          id: "dashboard-page",
          title: this.$t("Home"),
          icon: "mdi-home",
          to: { name: "dashboard-page" },
          isActive: this.display === "bottom-navigation"
        },
        {
          id: "dashboard",
          title: this.$t("Activity"),
          icon: "mdi-pulse",
          to: {
            name: "dashboard-organization-page",
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
        {
          id: "dashboard",
          title: this.$t("Activity"),
          icon: "mdi-pulse",
          to: {
            name: "project-dashboard",
            params: { projectId: this.projectId }
          }
        },
        {
          id: "tasks",
          title: this.$t("Tasks"),
          icon: "mdi-format-list-bulleted",
          to: { name: "project", params: { projectId: this.projectId } }
        },
        {
          id: "planning",
          title: this.$t("Planning"),
          icon: "mdi-chart-timeline-variant",
          to: {
            name: "project-timeline",
            params: { projectId: this.projectId }
          }
        },
        {
          id: "attachments",
          title: this.$t("Attachments"),
          icon: "mdi-attachment",
          to: {
            name: "project-attachments-page",
            params: { projectId: this.projectId }
          },
          isActive: this.display !== "bottom-navigation"
        },
        {
          id: "bpmn",
          title: this.$t("BPMN"),
          icon: "mdi-chart-donut",
          to: { name: "project-bpmn", params: { projectId: this.projectId } },
          isActive: this.display !== "bottom-navigation"
        },
        {
          id: "canvas",
          title: this.$t("Canvas"),
          icon: "mdi-file-document-box-check",
          to: { name: "project-canvas", params: { projectId: this.projectId } },
          isActive: this.display !== "bottom-navigation"
        },
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
      if (this.project && this.project.organizationId) {
        menuItems.unshift({
          id: "dashboard-page",
          title: this.$t("Home"),
          icon: "mdi-view-dashboard",
          to: {
            name: "dashboard-organization-page",
            params: { organizationId: this.project.organizationId }
          },
          isActive: this.display === "bottom-navigation"
        });
      } else {
        menuItems.unshift({
          id: "dashboard-page",
          title: this.$t("Home"),
          icon: "mdi-home",
          to: {
            name: "dashboard-page"
          },
          isActive: this.display === "bottom-navigation"
        });
      }
      if (this.canManageProject(this.projectId)) {
        menuItems.push({
          id: "settings",
          title: this.$t("Settings"),
          icon: "mdi-settings",
          to: {
            name: "project-settings",
            params: { projectId: this.projectId }
          },
          isActive: this.display === "list"
        });
      }
      return menuItems;
    }
  },
  methods: {
    canManageProject(projectId) {
      return (
        Permissions.isAdmin(Meteor.userId(), projectId)
        || Permissions.isAdmin(Meteor.userId())
      );
    },
    handleOnClick(menuItem) {
      if (!menuItem.onClick || typeof menuItem.onClick !== "function") return true;
      return menuItem.onClick();
    }
  }
};
</script>
<style lang="scss">
// Should not be scoped for overriding vuetify styles
@import "/imports/ui/styles/mixins/tabs-menu";
@import "/imports/ui/styles/mixins/breakpoint";

.main-menu {
  .main-menu-tabs {
    @include tabs-menu;
  }
  .v-item-group.v-bottom-navigation--fixed {
    z-index: 8;
  }
  .v-item-group.v-bottom-navigation .v-btn {
    @include media-query("sm-and-down") {
      max-width: 56px;
    }
  }
}
</style>
