<template>
  <v-app-bar
    class="top-bar"
    :dense="dense"
    :color="navigationColor"
    :dark="isNavigationColorDark"
    app
    clipped-left
  >
    <v-row>
      <!-- [ProjectTitle|OrganizationTitle|HomeTitle] -->
      <v-col v-show="!isFullSearchEnabled" cols="12" sm="12" md="8" lg="3">
        <top-bar-title
          :organization="currentOrganization"
          :project="currentProject"
        />
      </v-col>
      <!-- [ProjectMenu|OrganizationMenu] -->
      <v-col v-show="isFullSearchEnabled || $vuetify.breakpoint.lgAndUp" cols="4" sm="4" md="12" lg="6">
        <search-input v-model="isSearchEnabled" @blur="isSearchEnabled = false" />
        <main-menu
          v-show="!isSearchEnabled"
          v-if="currentProject || currentOrganization"
          display="tabs"
          :dark="isContentDark"
          :project="currentProject"
          :only-icons="$vuetify.breakpoint.mdOnly"
          :organization="currentOrganization"
          radius
        />
        </v-col>
        <!-- SearchBar, Notification and Profile -->
        <v-col v-show="!isFullSearchEnabled && $vuetify.breakpoint.mdAndUp" cols="4" md="4" lg="3">
          <top-bar-additional-menu
            :is-search-enabled="isSearchEnabled"
            @toggle-search="isSearchEnabled = $event"
          />
        </v-col>
    </v-row>
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
      return this.$vuetify.breakpoint.mdOnly && this.isSearchEnabled;
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
    @include media-query("sm-and-down") {
      padding: 0 8px;
    }
    display: flex;
    justify-content: space-between;
  }
}
</style>
