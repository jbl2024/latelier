<template>
  <v-app-bar class="top-bar" :dense="dense" :color="topBarColor" dark app clipped-left>
    <v-app-bar-nav-icon
      v-show="$vuetify.breakpoint.mdAndDown"
      @click.stop="showMobileDrawer = !showMobileDrawer"
    />
    <!-- [ProjectTitle|OrganizationTitle|HomeTitle] -->
    <top-bar-title
      :organization="currentOrganization"
      :project="currentProject"
    />
    <project-menu
      v-if="$vuetify.breakpoint.lgAndUp && currentProject"
      :project="currentProject"
      :background-color="navBarColor"
      radius
    />
    <organization-menu
      v-else-if="$vuetify.breakpoint.lgAndUp && currentOrganization"
      :organization="currentOrganization"
      :background-color="navBarColor"
      radius
    />
    <!-- SearchBar, Notification and Profile -->
    <top-bar-additional-menu v-if="$vuetify.breakpoint.mdAndUp" />
  </v-app-bar>
</template>
<script>
import { mapState } from "vuex";
import ProjectMenu from "/imports/ui/projects/ProjectMenu";
import TopBarTitle from "./TopBarTitle";
import TopBarAdditionalMenu from "./TopBarAdditionalMenu";

export default {
  components: {
    ProjectMenu,
    TopBarTitle,
    TopBarAdditionalMenu
  },
  props: {
    dense: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState("project", ["currentProject"]),
    ...mapState("organization", ["currentOrganization"]),
    topBarColor() {
      return "primary";
    },
    navBarColor() {
      return "#555555";
    },
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
<style lang="scss">
  .top-bar {
    .v-toolbar__content {
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
    }
  }
</style>
