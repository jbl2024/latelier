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
        <main-menu
          v-if="(currentProject || currentOrganization)"
          display="list"
          :project="currentProject"
          :organization="currentOrganization"
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
import MainMenu from "/imports/ui/ui/MainMenu";

export default {
  components: {
    MainMenu
  },
  data() {
    return {
      openMenu: false
    };
  },
  computed: {
    ...mapState([
      "showCategories",
      "showDashboardTitle"
    ]),
    ...mapState("project", ["currentProject"]),
    ...mapState("organization", ["currentOrganizationId", "currentOrganization"]),
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
