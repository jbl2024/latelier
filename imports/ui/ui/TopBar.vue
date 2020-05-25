<template>
  <v-app-bar
    class="top-bar"
    :dense="dense"
    :color="navigationColor"
    :dark="isNavigationColorDark"
    app
    clipped-left
  >
    <!-- [ProjectTitle|OrganizationTitle|HomeTitle] -->
    <top-bar-title
      :organization="currentOrganization"
      :project="currentProject"
    />
    <!-- [ProjectMenu|OrganizationMenu] -->
    <search-input v-model="isSearchEnabled" @blur="isSearchEnabled = false" />

    <main-menu
      v-show="!isSearchEnabled"
      v-if="$vuetify.breakpoint.lgAndUp && (currentProject || currentOrganization)"
      display="tabs"
      :dark="isContentDark"
      :project="currentProject"
      :organization="currentOrganization"
      radius
    />
    <!-- SearchBar, Notification and Profile -->
    <top-bar-additional-menu
      v-if="$vuetify.breakpoint.mdAndUp"
      :is-search-enabled="isSearchEnabled"
      @toggle-search="isSearchEnabled = $event"
    />
  </v-app-bar>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import TopBarTitle from "./TopBarTitle";
import TopBarAdditionalMenu from "./TopBarAdditionalMenu";
import MainMenu from "./MainMenu";

export default {
  components: {
    TopBarTitle,
    TopBarAdditionalMenu,
    MainMenu
  },
  props: {
    dense: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isSearchEnabled: false
    };
  },
  computed: {
    ...mapState("ui", ["navigationColor"]),
    ...mapGetters("ui", [
      "isNavigationColorDark",
      "isContentDark"
    ]),
    ...mapState("project", ["currentProject"]),
    ...mapState("organization", ["currentOrganization"])
  },
  watch: {
    "$route.fullPath"() {
      this.isSearchEnabled = false;
    }
  }
};
</script>
<style lang="scss">
  .top-bar {
    transition: background-color 50ms linear;
    .v-toolbar__content {
      padding: 0 16px;
      display: flex;
      justify-content: space-between;
    }
  }
</style>
