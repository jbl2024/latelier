<template>
  <!-- Menu mobile -->
  <v-hover v-slot:default="{ hover }" open-delay="300" :value="openMenu">
    <v-navigation-drawer
      v-model="showMobileDrawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      fixed
      dark
      left
      width="270px"
      class="showMobileDrawer"
      :mini-variant="!hover && !$vuetify.breakpoint.xs"
      :mini-variant-width="80"
    >
      <div ref="menu" class="drawer-wrapper">
        <organization-menu
          v-if="currentOrganizationId && !currentProjectId"
          :organization-id="currentOrganizationId"
        />
        <project-menu
          v-if="currentProject"
          :project="currentProject"
          :organization-id="currentOrganizationId"
        />
        <project-groups
          v-if="showCategories"
          :organization-id="currentOrganizationId"
        />
        <login-menu />
      </div>
    </v-navigation-drawer>
  </v-hover>
</template>
<script>
import { mapState } from "vuex";
import ProjectMenu from "/imports/ui/projects/ProjectMenu";

export default {
  components: {
    ProjectMenu
  },
  data() {
    return {
      openMenu: false
    };
  },
  computed: {
    ...mapState([
      "showCategories",
      "showDashboardTitle",
      "currentOrganizationId"
    ]),
    ...mapState("project", ["currentProjectId", "currentProject"]),
    showMobileDrawer: {
      set(showMobileDrawer) {
        this.$store.commit("updateShowMobileDrawer", showMobileDrawer);
      },
      get() {
        return this.$store.state.showMobileDrawer;
      }
    }
  }
};
</script>
