<template>
  <v-app-bar class="top-bar" dense :color="topBarColor" dark app clipped-left>
    <v-app-bar-nav-icon
      v-show="$vuetify.breakpoint.mdAndDown"
      @click.stop="showMobileDrawer = !showMobileDrawer"
    />
    <top-bar-title :organization-id="currentOrganizationId" :project="currentProject" />
    <!-- Project Menu Items -->
    <project-menu
      v-if="$vuetify.breakpoint.lgAndUp && currentProject"
      :project="currentProject"
      :background-color="topBarColor"
    />
    <div v-if="$vuetify.breakpoint.mdAndUp" class="additional-menu">
      <v-btn
        v-show="!showSearchInput"
        class="prevent-search-blur"
        icon
        @click="showSearchInput = !showSearchInput"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <search-input v-show="showSearchInput" @blur="showSearchInput = false" />
      <notification-button />
      <v-avatar dark>
        <v-menu offset-y eager>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <author-avatar v-if="hasAvatar" small :user-id="currentUser" />
              <v-icon v-if="!hasAvatar">
                mdi-account-circle
              </v-icon>
            </v-btn>
          </template>
          <login-menu />
        </v-menu>
      </v-avatar>
    </div>
  </v-app-bar>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import ProjectMenu from "/imports/ui/projects/ProjectMenu";
import TopBarTitle from "./TopBarTitle";

export default {
  components: {
    ProjectMenu,
    TopBarTitle
  },
  data() {
    return {
      showSearchInput: false
    };
  },
  computed: {
    ...mapState(["currentOrganizationId"]),
    ...mapState("project", ["currentProject"]),
    ...mapGetters(["hasAvatar"]),
    topBarColor() {
      return "primary";
    },
    showMobileDrawer: {
      set(showMobileDrawer) {
        this.$store.commit("updateShowMobileDrawer", showMobileDrawer);
      },
      get() {
        return this.$store.state.showMobileDrawer;
      }
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  }
};
</script>
<style lang="scss">
  .top-bar {
    .v-toolbar__content {
      padding: 0 16px;
    }
    .project-menu {
      height:100%;
      padding: 0 0.5rem;
    }
    .additional-menu {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height:100;
      max-width: 100%;
      flex-grow: 3;
    }
  }
</style>
