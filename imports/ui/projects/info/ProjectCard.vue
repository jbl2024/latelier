<template>
  <v-card
    class="card"
    tabindex="0"
    :style="getColorCardStyle(project)"
    @keyup.enter.native="openProject(project)"
    @click="openProject(project)"
  >
    <v-card-title>
      <div>
        <div class="name">
          {{ project.name }}
        </div>
        <div class="subtitle grey--text">
          {{ formatProjectDates(project) }}
        </div>
      </div>
    </v-card-title>
    <v-divider />
    <template v-if="project.description && project.description.length > 0">
      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <div
              class="ql-editor-view description"
              v-html="linkifyHtml(project.description)"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
    </template>
    <v-card-text>
      <v-row>
        <v-col :cols="3">
          <div class="indicator sep">
            <div class="legend grey--text">
              <v-icon small>
                mdi-format-list-bulleted
              </v-icon>
              <template v-if="!$vuetify.breakpoint.xsOnly">
                {{ $t('Pending tasks') }}
              </template>
            </div>
            <div class="number">
              {{ taskCount(info) }}
            </div>
          </div>
        </v-col>
        <v-col :cols="3">
          <div class="indicator sep">
            <div class="legend grey--text">
              <v-icon small>
                mdi-check
              </v-icon>
              <template v-if="!$vuetify.breakpoint.xsOnly">
                {{ $t('Completed tasks') }}
              </template>
            </div>
            <div class="number">
              {{ completedTaskCount(info) }}
            </div>
          </div>
        </v-col>
        <v-col :cols="3">
          <div class="indicator sep">
            <div class="legend grey--text">
              <v-icon small>
                mdi-account-group
              </v-icon>
              <template v-if="!$vuetify.breakpoint.xsOnly">
                {{ $t('Users') }}
              </template>
            </div>
            <div class="number">
              {{ userCount(project) }}
            </div>
          </div>
        </v-col>
        <v-col :cols="3">
          <div class="indicator">
            <div class="legend grey--text">
              <v-icon small>
                mdi-attachment
              </v-icon>
              <template v-if="!$vuetify.breakpoint.xsOnly">
                {{ $t('Attachments') }}
              </template>            
            </div>
            <div class="number">
              12
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn icon>
        <v-icon
          :class="getVisibilityIconClass(project)"
          :color="getColor(project)"
        >
          {{ getVisibilityIcon(project) }}
        </v-icon>
      </v-btn>
      <v-spacer />

      <v-tooltip v-if="!isFavorite(user, project._id)" top>
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

      <v-tooltip v-if="isFavorite(user, project._id)" top>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            text
            color="primary"
            @click.stop="removeFromFavorites(user, project._id)"
            v-on="on"
          >
            <v-icon>mdi-star</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Remove from favorites") }}</span>
      </v-tooltip>

      <v-tooltip v-if="!isSubscribedToDigests(user, project._id)" top>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            text
            color="grey darken-1"
            @click.stop="addToDigests(user, project._id)"
            v-on="on"
          >
            <v-icon>mdi-email-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Add to daily digest") }}</span>
      </v-tooltip>

      <v-tooltip v-if="isSubscribedToDigests(user, project._id)" top>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            text
            color="primary"
            @click.stop="removeFromDigests(user, project._id)"
            v-on="on"
          >
            <v-icon>mdi-email</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("Remove from daily digest") }}</span>
      </v-tooltip>

      <template v-if="canManageProject(project)">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="grey darken-1"
              v-on="on"
              @click.stop="openProjectSettings(project)"
            >
              <v-icon>mdi-settings</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Settings") }}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="grey darken-1"
              v-on="on"
              @click.stop="deleteProject(project)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Move to trash") }}</span>
        </v-tooltip>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";


export default {
  name: "ProjectCard",
  mixins: [TextRenderingMixin, DatesMixin],
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    user: {
      type: Object,
      default: () => {}
    },
    info: {
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
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(project.endDate)}`;
      }
      if (project.startDate) {
        return `A partir du ${this.formatDate(project.startDate)}`;
      }
      if (project.endtDate) {
        return `Jusqu'au ${this.formatDate(project.endDate)}`;
      }
      return "";
    },

    taskCount(info) {
      if (!info) return 0;

      return info.taskCount;
    },

    completedTaskCount(info) {
      if (!info) return 0;

      return info.completedTaskCount;
    },

    userCount(project) {
      const members = project.members || [];
      return members.length;
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
          this.$store.dispatch("notify", this.$t("Project added to daily digest"));
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
    },    
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
