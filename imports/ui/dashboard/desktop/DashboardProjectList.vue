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
    <v-list-tile-action class="show-desktop" v-if="canManageProject(project)">
      <v-tooltip top slot="activator">
        <v-btn
          icon
          flat
          slot="activator"
          color="grey darken-1"
          @click.stop="openProjectSettings(project)"
        >
          <v-icon>settings</v-icon>
        </v-btn>
        <span>{{ $t('Settings') }}</span>
      </v-tooltip>
    </v-list-tile-action>
    <v-list-tile-action class="show-desktop">
      <v-tooltip top slot="activator">
        <v-btn
          icon
          flat
          color="grey darken-1"
          @click.stop="cloneProject(project)"
          slot="activator"
        >
          <v-icon>file_copy</v-icon>
        </v-btn>
        <span>{{ $t('Clone') }}</span>
      </v-tooltip>
    </v-list-tile-action>
    <v-list-tile-action class="show-desktop" v-if="canDeleteProject(project)">
      <v-tooltip top slot="activator">
        <v-btn
          icon
          flat
          color="grey darken-1"
          @click.stop="deleteProject(project)"
          slot="activator"
        >
          <v-icon>delete</v-icon>
        </v-btn>
        <span>{{ $t('Delete') }}</span>
      </v-tooltip>
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
        confirmText: this.$t("Delete")
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