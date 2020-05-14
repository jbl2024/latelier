<template>
  <div v-if="organizationId" class="organization-menu">
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
        <v-list-item v-for="menuItem in menuItems" :key="menuItem.id" :to="menuItem.to">
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
    organization: {
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
    organizationId() {
      if (!this.organization) return null;
      return this.organization._id;
    },
    menuItems() {
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
    }
  }
};
</script>
<style lang="scss" scoped>
@import "/imports/ui/styles/mixins/tabs-menu";

.organization-menu {
  @include tabs-menu;
}
</style>
