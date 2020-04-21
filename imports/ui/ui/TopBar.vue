<template>
  <v-app-bar class="top-bar" color="primary" dark app fixed>
    <v-app-bar-nav-icon v-show="$vuetify.breakpoint.mdAndDown" @click.stop="showMobileDrawer = !showMobileDrawer"/>
    <top-bar-title :projectId="currentProjectId ? currentProjectId : null"/>
    <project-menu v-if="$vuetify.breakpoint.lgAndUp && currentProjectId" :project-id="currentProjectId" />
    <div v-if="$vuetify.breakpoint.mdAndUp" class="additional-menu">
      <v-btn class="prevent-search-blur" icon v-show="!showSearchInput" @click="showSearchInput = !showSearchInput">
        <v-icon class="prevent-search-blur">mdi-magnify</v-icon>
      </v-btn>
      <search-input @blur="showSearchInput = false" v-show="showSearchInput"/>
      <v-avatar dark>
        <v-menu offset-y eager>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <author-avatar v-if="hasAvatar" small :user-id="currentUser"/>
              <v-icon v-if="!hasAvatar">
                mdi-account-circle
              </v-icon>
            </v-btn>
          </template>
          <login-menu />
        </v-menu>
      </v-avatar>
      <notification-button />
    </div>
  </v-app-bar>
</template>
<script>
import { mapState } from "vuex";
import ProjectMenu from '/imports/ui/projects/ProjectMenu';
import TopBarTitle from './TopBarTitle';
export default {
  components: {
    ProjectMenu,
    TopBarTitle
  },
  data() {
    return {
      showSearchInput: false
    }
  },
  computed: {
    ...mapState([
      "currentProjectId",
    ]),
    showMobileDrawer: {
      set(showMobileDrawer) {
        this.$store.commit('updateShowMobileDrawer', showMobileDrawer)
      },
      get() {
        return this.$store.state.showMobileDrawer
      }
    },
    hasAvatar() {
      return Boolean(Meteor && this.currentUser?.profile?.avatar)
    }
  }
}
</script>
<style>
  .top-bar .v-toolbar__content {
    padding: 0 16px;
  }
  .top-bar .project-menu {
    height:100%;
    padding: 0 0.5rem;
  }
  .top-bar .additional-menu {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height:100;
    max-width: 100%;
  }
  .top-bar .additional-menu {
    flex-grow: 3;
  }
</style>