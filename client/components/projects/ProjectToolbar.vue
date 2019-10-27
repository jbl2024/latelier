<template>
  <v-toolbar ref="toolbar" v-resize="onResizeToolbar" class="flex0" dense>
    <project-filters-dialog
      :active.sync="showFiltersDialog"
      :project-id="project._id"
    />

    <v-btn v-if="showFilters" icon @click="showFiltersDialog = true">
      <v-icon>mdi-filter-variant</v-icon>
    </v-btn>

    <project-filters v-if="!showFilters" :project-id="project._id" />

    <v-spacer />
    <div>
      <v-tooltip v-if="!isFavorite(user, project._id)" top>
        <template v-slot:activator="{ on }">
          <v-btn icon @click.stop="addToFavorites(user, project._id)" v-on="on">
            <v-icon>mdi-star-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Add to favorites") }}</span>
      </v-tooltip>
    </div>
    <div>
      <v-tooltip v-if="isFavorite(user, project._id)" top>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            @click.stop="removeFromFavorites(user, project._id)"
            v-on="on"
          >
            <v-icon>mdi-star</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Remove from favorites") }}</span>
      </v-tooltip>
    </div>
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
