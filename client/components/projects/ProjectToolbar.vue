<template>
  <v-toolbar dense class="flex0">
    <project-filters-dialog :active.sync="showFiltersDialog" :project-id="project._id"></project-filters-dialog>

    <v-btn icon @click="showFiltersDialog = true" v-if="$vuetify.breakpoint.smAndDown">
      <v-icon>filter_list</v-icon>
    </v-btn>

    <project-filters :projectId="project._id" v-if="$vuetify.breakpoint.mdAndUp"></project-filters>

    <v-spacer></v-spacer>
    <div>
      <v-tooltip top slot="activator" v-if="!isFavorite(user, project._id)">
        <v-btn icon @click.stop="addToFavorites(user, project._id)" slot="activator">
          <v-icon>star_border</v-icon>
        </v-btn>
        <span>{{ $t('Add to favorites') }}</span>
      </v-tooltip>
    </div>
    <div>
      <v-tooltip top slot="activator" v-if="isFavorite(user, project._id)">
        <v-btn icon @click.stop="removeFromFavorites(user, project._id)" slot="activator">
          <v-icon>star</v-icon>
        </v-btn>
        <span>{{ $t('Remove from favorites') }}</span>
      </v-tooltip>
    </div>
    <v-btn
      v-if="canManageProject(project)"
      icon
      :to="{ name: 'project-settings', params: { projectId: project._id }}"
    >
      <v-icon>settings</v-icon>
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
    }
  }
};
</script>

<style scoped>
</style>