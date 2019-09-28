<template>
  <v-list-item @click="openProject(project)">
    <v-list-item-avatar :color="getColor(project)">
      <v-icon :class="getVisibilityIconClass(project)">{{ getVisibilityIcon(project) }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content class="pointer">
      <v-list-item-title>{{ project.name }}</v-list-item-title>
      <v-list-item-subtitle>{{ formatProjectDates(project) }}</v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action
      v-for="group in getProjectGroups(project)"
      class="show-desktop"
      :key="group._id"
      @click.stop="selectGroup(group)"
    >
      <v-chip small color="primary" text-color="white">{{ group.name }}</v-chip>
    </v-list-item-action>

    <v-list-item-action>
      <v-tooltip top v-if="!isFavorite(user, project._id)">
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            text
            color="grey darken-1"
            @click.stop="addToFavorites(user, project._id)"
            v-on="on"
          >
            <v-icon>mdi-star-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Add to favorites') }}</span>
      </v-tooltip>

      <v-btn v-if="isFavorite(user, project._id)" icon text color="primary" @click.stop="removeFromFavorites(user, project._id)" slot="activator">
        <v-icon>mdi-star</v-icon>
      </v-btn>
    </v-list-item-action>

    <v-list-item-action>
      <v-menu bottom left class="menu">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon text color="grey darken-1" @click.native.stop>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="openProjectSettings(project)" v-if="canManageProject(project)">
            <v-list-item-action>
              <v-icon>mdi-settings</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t('Settings') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="cloneProject(project)">
            <v-list-item-action>
              <v-icon>mdi-content-copy</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t('Clone') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteProject(project)" v-if="canManageProject(project)">
            <v-list-item-action>
              <v-icon>mdi-delete</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t('Move to trash') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="leaveProject(project)" v-if="canLeaveProject(project)">
            <v-list-item-action>
              <v-icon>mdi-exit-to-app</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t('Leave project') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item-action>
  </v-list-item>
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
import { ProjectStates, ProjectAccessRights } from "/imports/api/projects/projects.js";

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
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },

    getVisibilityIconClass(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
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

    canLeaveProject(project) {
      return Meteor.userId() !== project.createdBy;
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

    leaveProject(project) {
      this.$confirm(this.$t("Leave project?"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Leave project")
      }).then(res => {
        if (res) {
          Meteor.call(
            "projects.leave",
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
              } else {
                this.$store.dispatch("notify", this.$t('Project cloned successfully'));
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