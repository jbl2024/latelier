<template>
  <v-list-tile @click="openProject(project)">
    <v-list-tile-avatar :color="getColor(project)">
      <v-icon :class="getVisibilityIconClass(project)">{{ getVisibilityIcon(project) }}</v-icon>
    </v-list-tile-avatar>
    <v-list-tile-content class="pointer">
      <v-list-tile-title>{{ project.name }}</v-list-tile-title>
      <v-list-tile-sub-title>{{ formatProjectDates(project) }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-action
      v-for="group in getProjectGroups(project)"
      class="show-desktop"
      :key="group._id"
      @click.stop="selectGroup(group)"
    >
      <v-chip small color="primary" text-color="white">{{ group.name }}</v-chip>
    </v-list-tile-action>

    <v-list-tile-action>
      <v-tooltip top slot="activator" v-if="!isFavorite(user, project._id)">
        <v-btn
          icon
          flat
          color="grey darken-1"
          @click.stop="addToFavorites(user, project._id)"
          slot="activator"
        >
          <v-icon>star_border</v-icon>
        </v-btn>
        <span>{{ $t('Add to favorites') }}</span>
      </v-tooltip>

      <v-btn v-if="isFavorite(user, project._id)" icon flat color="primary" @click.stop="removeFromFavorites(user, project._id)" slot="activator">
        <v-icon>star</v-icon>
      </v-btn>
    </v-list-tile-action>

    <v-list-tile-action>
      <v-menu bottom left class="menu" @click.native.stop>
        <v-btn slot="activator" icon flat color="grey darken-1">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list dense>
          <v-list-tile @click="openProjectSettings(project)" v-if="canManageProject(project)">
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>{{ $t('Settings') }}</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="cloneProject(project)">
            <v-list-tile-action>
              <v-icon>file_copy</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>{{ $t('Clone') }}</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="deleteProject(project)" v-if="canManageProject(project)">
            <v-list-tile-action>
              <v-icon>delete</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>{{ $t('Move to trash') }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {};
</script>

<style>
</style>

</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Permissions } from "/imports/api/permissions/permissions";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { ProjectStates } from "/imports/api/projects/projects.js";

export default {
  name: "dashboard-project-list",
  mixins: [DatesMixin],
  props: {
    project: Object,
    user: Object
  },
  i18n: {
    messages: {
      en: {
        Users: "Users",
        Tasks: "Tasks"
      },
      fr: {
        Users: "Utilisateurs",
        Tasks: "Tâches"
      }
    }
  },
  methods: {
    getVisibilityIcon(project) {
      if (project.isPublic) {
        return "visibility";
      }
      return "visibility_off";
    },

    getVisibilityIconClass(project) {
      if (project.isPublic) {
        return "";
      }
      return "";
    },

    getColor(project) {
      return project.color;
    },

    getColorCardStyle(project) {
      if (project.color) {
        return `background: linear-gradient(0deg, #fff 95%, ${
          project.color
        } 95%);`;
        // return `background: linear-gradient(90deg, ${project.color} 3%, #fff 3%);`
      }
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return (
          "Du  " +
          this.formatDate(project.startDate) +
          " au " +
          this.formatDate(project.endDate)
        );
      } else if (project.startDate) {
        return "A partir du " + this.formatDate(project.startDate);
      } else if (project.endtDate) {
        return "Jusqu'au " + this.formatDate(project.endDate);
      }
    },

    taskCount(project) {
      return project.taskCount;
    },

    userCount(project) {
      const members = project.members || [];
      return members.length;
    },

    canDeleteProject(project) {
      if (
        Permissions.isAdmin(Meteor.userId()) ||
        project.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id) ||
        Permissions.isAdmin(Meteor.userId())
      );
    },

    openProject(project) {
      this.$router.push({
        name: "project",
        params: {
          projectId: project._id
        }
      });
    },

    openProjectSettings(project) {
      this.$router.push({
        name: "project-settings",
        params: {
          organizationId: project.organizationId,
          projectId: project._id
        }
      });
    },

    deleteProject(project) {
      this.$confirm(this.$t("Delete project?"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Move to trash")
      }).then(res => {
        if (res) {
          Meteor.call(
            "projects.remove",
            { projectId: project._id },
            (error, result) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Project deleted"));
            }
          );
        }
      });
    },

    isFavorite(user, projectId) {
      let favorites = [];
      if (user && user.profile) {
        favorites = user.profile.favoriteProjects || [];
      }
      return favorites.indexOf(projectId) >= 0;
    },

    addToFavorites(user, projectId) {
      this.$nextTick(() => {
        Meteor.call(
          "projects.addToUserFavorites",
          { projectId: projectId, userId: user._id },
          (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch(
              "notify",
              this.$t("Project added to favorites")
            );
          }
        );
      });
    },

    removeFromFavorites(user, projectId) {
      this.$store.dispatch("notify", this.$t("Project removed from favorites"));
      this.$nextTick(() => {
        Meteor.call(
          "projects.removeFromUserFavorites",
          { projectId: projectId, userId: user._id },
          (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
          }
        );
      });
    },

    getProjectGroups(project) {
      return ProjectGroups.find(
        { projects: project._id },
        { sort: { name: 1 } }
      ).fetch();
    },
    selectGroup(group) {
      var selectedGroup = this.$store.state.selectedGroup;
      if (selectedGroup && selectedGroup._id === group._id) {
        this.$store.dispatch("setSelectedGroup", null);
      } else {
        this.$store.dispatch("setSelectedGroup", group);
      }
    },

    cloneProject(project) {
      this.$confirm(this.$t("Do you really want to clone this project?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then(res => {
        if (res) {
          Meteor.call(
            "projects.clone",
            { projectId: project._id },
            (error, result) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
            }
          );
        }
      });
    }
  }
};
</script>

<style scoped>

</style>