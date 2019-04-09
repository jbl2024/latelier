<template>
  <v-card class="card" @click="openProject(project)">
    <v-card-title>
      <div>
        <div class="name">{{ project.name }}</div>
        <div class="subtitle grey--text">{{ formatProjectDates(project) }}</div>
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <!-- <v-card-text>
      <v-layout>
        <v-flex xs6>
          <div class="indicator sep">
            <div class="legend grey--text">{{ $t('Tasks') }}</div>
            <div class="number">{{ taskCount(project) }}</div>
          </div>
        </v-flex>
        <v-flex xs6>
          <div class="indicator">
            <div class="legend grey--text">{{ $t('Users') }}</div>
            <div class="number">{{ userCount(project) }}</div>
          </div>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-divider></v-divider> -->
    <v-card-actions>
      <v-btn icon>
      <v-icon :class="getVisibilityIconClass(project)" :color="getColor(project)">{{ getVisibilityIcon(project) }}</v-icon>
      </v-btn>
      <v-spacer></v-spacer>

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

      <v-tooltip top slot="activator" v-if="isFavorite(user, project._id)">
        <v-btn icon flat color="primary" @click.stop="removeFromFavorites(user, project._id)" slot="activator">
          <v-icon>star</v-icon>
        </v-btn>
        <span>{{ $t('Remove from favorites') }}</span>
      </v-tooltip>

      <template v-if="canManageProject(project)">
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
        <v-tooltip top slot="activator">
          <v-btn
            icon
            flat
            slot="activator"
            color="grey darken-1"
            @click.stop="deleteProject(project)"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <span>{{ $t('Settings') }}</span>
        </v-tooltip>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "dashboard-project-card",
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

    getColor(item) {
      return item.color;
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
            this.$store.dispatch("notify", this.$t("Project added to favorites"));
          }
        );
      });
    },

    removeFromFavorites(user, projectId) {
      this.$store.dispatch(
        "notify",
        this.$t("Project removed from favorites")
      );
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
      })
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