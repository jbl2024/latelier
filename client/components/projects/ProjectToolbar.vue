<template>
  <v-toolbar v-if="project" ref="toolbar" v-resize="onResizeToolbar" class="flex0" dense>
    <tasks-export
      v-model="showTasksExport"
      :project-id="project._id"
    />
    <project-trashcan ref="projectTrashcan" :project-id="project._id" />
    <project-history-dialog v-model="showHistory" :project-id="project._id" />

    <project-filters-dialog
      v-model="showFiltersDialog"
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
      v-if="$vuetify.breakpoint.smAndUp"
      bottom
      icon="mdi-history"
      :tooltip="$t('History')"
      @on="openHistory()"
    />
    <tooltip-button
      v-if="isFavorite(user, project._id)"
      bottom
      icon="mdi-star"
      :tooltip="$t('Remove from favorites')"
      @on="removeFromFavorites(user, project._id)"
    />
    <tooltip-button
      v-if="!isSubscribedToDigests(user, project._id)"
      bottom
      icon="mdi-email-outline"
      :tooltip="$t('Add to daily digest')"
      @on="addToDigests(user, project._id)"
    />
    <tooltip-button
      v-if="isSubscribedToDigests(user, project._id)"
      bottom
      icon="mdi-email"
      :tooltip="$t('Remove from daily digest')"
      @on="removeFromDigests(user, project._id)"
    />
    <tooltip-button
      bottom
      icon="mdi-trash-can"
      :tooltip="$t('Trashcan')"
      @on="openTrashcan()"
    />
    <tooltip-button
      bottom
      icon="mdi-file-export"
      :tooltip="$t('Export tasks')"
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
      default: null
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showFilters: false,
      showFiltersDialog: false,
      showTasksExport: false,
      showHistory: false
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

    async addToFavorites(user, projectId) {
      try {
        await Meteor.callAsync("projects.addToUserFavorites", {
          projectId,
          userId: user._id
        });
        this.$notify(this.$t("Project added to favorites"));
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async removeFromFavorites(user, projectId) {
      try {
        await Meteor.callAsync("projects.removeFromUserFavorites", {
          projectId,
          userId: user._id
        });
        this.$store.dispatch("notify", this.$t("Project removed from favorites"));
      } catch (error) {
        this.$notifyError(error);
      }
    },

    isSubscribedToDigests(user, projectId) {
      let digests = [];
      if (user && user.profile) {
        digests = user.profile.digests || [];
      }
      return digests.indexOf(projectId) >= 0;
    },

    async addToDigests(user, projectId) {
      try {
        await Meteor.callAsync("projects.addToUserDigests", { projectId, userId: user._id });
        this.$notify(this.$t("Project added to daily digest"));
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async removeFromDigests(user, projectId) {
      try {
        await Meteor.callAsync("projects.removeFromUserDigests", {
          projectId,
          userId: user._id
        });
        this.$store.dispatch("notify", this.$t("Project removed from daily digest"));
      } catch (error) {
        this.$notifyError(error);
      }
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

    openTrashcan() {
      this.$refs.projectTrashcan.open();
    },

    openHistory() {
      this.showHistory = true;
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
  .flex0 {
    flex: 0;
  }
</style>
