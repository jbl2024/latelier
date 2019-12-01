<template>
  <v-toolbar ref="toolbar" v-resize="onResizeToolbar" class="flex0" dense>
    <tasks-export
      :project-id="project._id"
      :active.sync="showTasksExport"
    />

    <project-filters-dialog
      :active.sync="showFiltersDialog"
      :project-id="project._id"
    />

    <v-btn v-if="showFilters" icon @click="showFiltersDialog = true">
      <v-icon>mdi-filter-variant</v-icon>
    </v-btn>

    <project-filters v-if="!showFilters" :project-id="project._id" />

    <v-spacer />
    <tooltip-button
      v-if="!isFavorite(user, project._id)"
      bottom
      icon="mdi-star-outline"
      :tooltip="$t('Add to favorites')"
      @on="addToFavorites(user, project._id)"
    />
    <tooltip-button
      v-if="isFavorite(user, project._id)"
      bottom
      icon="mdi-star"
      :tooltip="$t('Remove from favorites')"
      @on="removeFromFavorites(user, project._id)"
    />
    <tooltip-button
      bottom
      icon="mdi-file-export"
      :tooltip="$t('Export')"
      @on="exportODS()"
    />
    <v-btn
      v-if="canManageProject(project)"
      icon
      :to="{ name: 'project-settings', params: { projectId: project._id } }"
    >
      <v-icon>mdi-settings</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";

export default {
  name: "ProjectToolbar",
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    user: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showFilters: false,
      showFiltersDialog: false,
      showTasksExport: false
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
        { projectId, userId: user._id },
        (error) => {
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
        { projectId, userId: user._id },
        (error) => {
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

    exportODS() {
      this.showTasksExport = true;
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id)
        || Permissions.isAdmin(Meteor.userId())
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

<style scoped></style>
