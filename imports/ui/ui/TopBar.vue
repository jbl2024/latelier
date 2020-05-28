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
      v-show="!isFullSearchEnabled"
      class="top-bar-left"
      :organization="currentOrganization"
      :project="currentProject"
    />
    <!-- [ProjectMenu|OrganizationMenu] -->
    <div
      v-show="isFullSearchEnabled || $vuetify.breakpoint.lgAndUp"
      :class="['top-bar-center', isSearchEnabled ? 'search-enabled' : null]"
    >
      <search-input v-model="isSearchEnabled" @blur="isSearchEnabled = false" />
      <main-menu
        v-show="!isSearchEnabled"
        v-if="currentProject || currentOrganization"
        display="tabs"
        :dark="isContentDark"
        :project="currentProject"
        :only-icons="currentProject && $vuetify.breakpoint.width <= 1368"
        :organization="currentOrganization"
        radius
      />
    </div>
    <!-- SearchBar, Notification and Profile -->
    <top-bar-additional-menu
      v-show="!isFullSearchEnabled && $vuetify.breakpoint.mdAndUp"
      class="top-bar-right"
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
    isFullSearchEnabled() {
      return this.$vuetify.breakpoint.mdAndDown && this.isSearchEnabled;
    },
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
@import "/imports/ui/styles/mixins/breakpoint";
.top-bar {
  transition: background-color 50ms linear;
  .v-toolbar__content {
    padding: 0 16px;
    @include media-query("md-and-down") {
      padding: 0 8px;
    }
    display: flex;
    justify-content: space-between;
  }

  .top-bar-left,
  .top-bar-right {
    flex: 1 1 25%;
  }
  .top-bar-center.search-enabled {
    flex: 1 1 50%;
  }
}
</style>
