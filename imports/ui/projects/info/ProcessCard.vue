<template>
  <v-card
    class="card"
    tabindex="0"
    @click="openProject(project)"
  >
    <v-card-title>
      <v-icon large left color="teal">mdi-chart-donut</v-icon>
      <span class="title font-weight-light">{{ $t("Process models") }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-layout>
        <v-flex xs6>
          <div class="indicator sep">
            <div class="legend grey--text">{{ $t("Current") }}</div>
            <div class="number">2</div>
          </div>
        </v-flex>
        <v-flex xs6>
          <div class="indicator">
            <div class="legend grey--text">{{ $t("Target") }}</div>
            <div class="number">1</div>
          </div>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn text>
        {{ $t("Add") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "ProcessCard",
  mixins: [DatesMixin],
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

    getColor(item) {
      return item.color;
    },

    getColorCardStyle(project) {
      if (project.color) {
        return `background: linear-gradient(0deg, #fff 95%, ${project.color} 95%);`;
        // return `background: linear-gradient(90deg, ${project.color} 3%, #fff 3%);`
      }
      return "";
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(
          project.endDate
        )}`;
      }
      if (project.startDate) {
        return `A partir du ${this.formatDate(project.startDate)}`;
      }
      if (project.endtDate) {
        return `Jusqu'au ${this.formatDate(project.endDate)}`;
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
      }).then((res) => {
        if (res) {
          Meteor.call(
            "projects.remove",
            { projectId: project._id },
            (error) => {
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
          (error) => {
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
          (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
            }
          }
        );
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
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$store.dispatch(
            "notify",
            this.$t("Project added to daily digest")
          );
        }
      );
    },

    removeFromDigests(user, projectId) {
      Meteor.call(
        "projects.removeFromUserDigests",
        { projectId, userId: user._id },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
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
.card {
  border-radius: 4px;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.card .name {
  font-size: 14px;
  font-weight: bold;
}

.card .subtitle {
  font-size: 12px;
  min-height: 18px;
}

.card .indicator {
  text-align: center;
}

.card .indicator .legend {
  font-size: 11px;
}

.card .indicator .number {
  font-size: 18px;
  font-weight: bold;
}

.card .sep {
  border-right: 1px solid #ededed;
}
</style>
