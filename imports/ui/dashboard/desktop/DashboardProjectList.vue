<template>
  <v-lazy
    :options="{
      threshold: 0.2,
    }"
    min-height="72"
    transition="fade-transition"
  >
    <v-list-item
      :class="{ archive: isArchived(project) }"
      @click="openProject(project)"
    >
      <v-list-item-avatar :color="getColor(project)">
        <v-icon :class="getVisibilityIconClass(project)">
          {{ getVisibilityIcon(project) }}
        </v-icon>
      </v-list-item-avatar>
      <v-list-item-content class="pointer">
        <v-list-item-title>{{ project.name }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ formatProjectDates(project) }}
          <v-chip v-if="isArchived(project)" x-small>
            {{ $t('Archived') }}
          </v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action
        v-for="group in getProjectGroups(project)"
        :key="group._id"
        class="show-desktop project-group"
        @click.stop="selectGroup(group)"
      >
        <v-chip small color="primary" text-color="white">
          {{ group.name }}
        </v-chip>
      </v-list-item-action>

      <v-list-item-action>
        <v-tooltip v-if="!isFavorite" top>
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
          <span>{{ $t("Add to favorites") }}</span>
        </v-tooltip>

        <v-btn
          v-if="isFavorite"
          slot="activator"
          icon
          text
          color="primary"
          @click.stop="removeFromFavorites(user, project._id)"
        >
          <v-icon>mdi-star</v-icon>
        </v-btn>
      </v-list-item-action>

      <v-list-item-action>
        <v-menu bottom left class="menu">
          <template v-slot:activator="{ on }">
            <v-btn icon text color="grey darken-1" v-on="on" @click.native.stop>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-if="!isSubscribedToDigests(user, project._id)"
              @click="addToDigests(user, project._id)"
            >
              <v-list-item-action>
                <v-icon>mdi-email-outline</v-icon>
              </v-list-item-action>
              <v-list-item-title>
                {{
                  $t("Add to daily digest")
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isSubscribedToDigests(user, project._id)"
              @click="removeFromDigests(user, project._id)"
            >
              <v-list-item-action>
                <v-icon>mdi-email</v-icon>
              </v-list-item-action>
              <v-list-item-title>
                {{
                  $t("Remove from daily digest")
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="canManageProject(project)"
              @click="openProjectSettings(project)"
            >
              <v-list-item-action>
                <v-icon>mdi-settings</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Settings") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="cloneProject(project)">
              <v-list-item-action>
                <v-icon>mdi-content-copy</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Clone") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="canManageProject(project)"
              @click="openProjectExport(project)"
            >
              <v-list-item-action>
                <v-icon> mdi-file-export </v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Export") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="!isArchived(project) && canManageProject(project)"
              @click="archiveProject(project)"
            >
              <v-list-item-action>
                <v-icon>mdi-archive</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Archive") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isArchived(project) && canManageProject(project)"
              @click="unarchiveProject(project)"
            >
              <v-list-item-action>
                <v-icon>mdi-package-up</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Unarchive") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="canManageProject(project)"
              @click="deleteProject(project)"
            >
              <v-list-item-action>
                <v-icon>mdi-delete</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Move to trash") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="canLeaveProject(project)"
              @click="leaveProject(project)"
            >
              <v-list-item-action>
                <v-icon>mdi-exit-to-app</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("Leave project") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-action>
    </v-list-item>
  </v-lazy>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Permissions } from "/imports/api/permissions/permissions";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import {
  ProjectAccessRights,
  ProjectStates
} from "/imports/api/projects/projects.js";

export default {
  name: "DashboardProjectList",
  mixins: [DatesMixin],
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: () => {}
    }
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
        return `background: linear-gradient(0deg, #fff 95%, ${project.color} 95%);`;
        // return `background: linear-gradient(90deg, ${project.color} 3%, #fff 3%);`
      }
      return "";
    },
    taskCount(project) {
      return project.taskCount;
    },

    userCount(project) {
      const members = project.members || [];
      return members.length;
    },

    isArchived(project) {
      return project.state === ProjectStates.ARCHIVED;
    },

    archiveProject(project) {
      Meteor.call("projects.updateState", {
        projectId: project._id,
        state: ProjectStates.ARCHIVED
      });
    },

    unarchiveProject(project) {
      Meteor.call("projects.updateState", {
        projectId: project._id,
        state: ProjectStates.DEVELOPMENT
      });
    },

    canDeleteProject(project) {
      if (
        Permissions.isAdmin(Meteor.userId())
        || project.createdBy === Meteor.userId()
      ) {
        return true;
      }
      return false;
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id)
        || Permissions.isAdmin(Meteor.userId())
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
    openProjectExport(project) {
      this.$router.push({
        name: "project-export",
        params: {
          projectId: project._id
        }
      });
    },
    deleteProject(project) {
      this.$confirm(this.$t("Delete project?"), {
        title: project.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Move to trash")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projects.remove",
            { projectId: project._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Project deleted"));
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
      }).then((res) => {
        if (res) {
          Meteor.call("projects.leave", { projectId: project._id }, (error) => {
            if (error) {
              this.$notifyError(error);
            }
          });
        }
      });
    },
    addToFavorites(user, projectId) {
      this.$nextTick(() => {
        Meteor.call(
          "projects.addToUserFavorites",
          { projectId: projectId, userId: user._id },
          (error) => {
            if (error) {
              this.$notifyError(error);
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
      this.$notify(this.$t("Project removed from favorites"));
      this.$nextTick(() => {
        Meteor.call(
          "projects.removeFromUserFavorites",
          { projectId: projectId, userId: user._id },
          (error) => {
            if (error) {
              this.$notifyError(error);
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
      const { selectedGroup } = this.$store.state;
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
      }).then((res) => {
        if (res) {
          Meteor.call("projects.clone", { projectId: project._id }, (error) => {
            if (error) {
              this.$notifyError(error);
            } else {
              this.$notify(this.$t("Project cloned successfully"));
            }
          });
        }
      });
    },

    isSubscribedToDigests(user, projectId) {
      let digests = [];
      if (user && user.profile) {
        digests = user.profile.digests || [];
      }
      return digests.indexOf(projectId) >= 0;
    },

    addToDigests(user, projectId) {
      Meteor.call(
        "projects.addToUserDigests",
        { projectId, userId: user._id },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.$notify(this.$t("Project added to daily digest"));
        }
      );
    },

    removeFromDigests(user, projectId) {
      Meteor.call(
        "projects.removeFromUserDigests",
        { projectId, userId: user._id },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.$store.dispatch(
            "notify",
            this.$t("Project removed from daily digest")
          );
        }
      );
    }
  }
};
</script>

<style scoped>
.project-group + .project-group {
  margin-left: 4px;
}

</style>
