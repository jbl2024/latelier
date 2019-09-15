<template>
  <v-toolbar dense class="flex0" ref="toolbar" v-resize="onResizeToolbar">
    <project-filters-dialog :active.sync="showFiltersDialog" :project-id="project._id"></project-filters-dialog>

    <v-btn icon @click="showFiltersDialog = true" v-if="showFilters">
      <v-icon>mdi-filter-variant</v-icon>
    </v-btn>

    <project-filters :projectId="project._id" v-if="!showFilters"></project-filters>

    <v-spacer></v-spacer>
    <div>
      <v-tooltip top v-if="!isFavorite(user, project._id)">
          <template v-slot:activator="{ on }">
            <v-btn icon @click.stop="addToFavorites(user, project._id)" v-on="on">
              <v-icon>mdi-star-outline</v-icon>
            </v-btn>
          </template>
        <span>{{ $t('Add to favorites') }}</span>
      </v-tooltip>
    </div>
    <div>
      <v-tooltip top v-if="isFavorite(user, project._id)">
        <template v-slot:activator="{ on }">
          <v-btn icon @click.stop="removeFromFavorites(user, project._id)" v-on="on">
            <v-icon>mdi-star</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Remove from favorites') }}</span>
      </v-tooltip>
    </div>
    <v-btn
      v-if="canManageProject(project)"
      icon
      :to="{ name: 'project-settings', params: { projectId: project._id }}"
    >
      <v-icon>mdi-settings</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";

export default {
  name: "project-toolbar",
  props: {
    project: Object,
    user: Object
  },
  data() {
    return {
      showFilters: false,
      showFiltersDialog: false
    };
  },
  methods: {
    isFavorite(user, projectId) {
      let favorites = [];
      if (user && user.profile) {
        favorites = user.profile.favoriteProjects || [];
      }
      return favorites.indexOf(projectId) >= 0;
    },

    addToFavorites(user, projectId) {
      Meteor.call(
        "projects.addToUserFavorites",
        { projectId: projectId, userId: user._id },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$store.dispatch("notify", this.$t("Project added to favorites"));
        }
      );
    },

    removeFromFavorites(user, projectId) {
      Meteor.call(
        "projects.removeFromUserFavorites",
        { projectId: projectId, userId: user._id },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$store.dispatch(
            "notify",
            this.$t("Project removed from favorites")
          );
        }
      );
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id) ||
        Permissions.isAdmin(Meteor.userId())
      );
    },

    onResizeToolbar() {
      const toolbar = this.$refs.toolbar.$el;
      const width = toolbar.offsetWidth;
      if (width < 780) {
        this.showFilters = true;
      } else {
        this.showFilters = false;
      }
    }

    
  }
};
</script>

<style scoped>
</style>