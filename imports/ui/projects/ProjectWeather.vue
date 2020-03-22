<template>
  <div class="project-weather">
    <edit-health-report
      ref="editHealthReport"
      :report="selectedReportForAction"
      @updated="refresh"
    />
    <new-health-report
      ref="newHealthReport"
      :project-id="projectId"
      @created="refresh"
    />
    <empty-state
      v-if="healthReports.length == 0 && !loading"
      class="empty"
      illustration="weather"
      :description="$t('No report defined')"
    >
      <v-btn class="info" @click="newHealthReport">
        {{ $t("Add report") }}
      </v-btn>
    </empty-state>

    <template v-if="healthReports.length > 0">
      <div
        ref="container"
        class="container-wrapper"
        :style="getBackgroundUrl(user)"
      >
        <div v-if="loading">
          <v-progress-linear indeterminate />
        </div>

        <v-container v-if="$vuetify.breakpoint.smAndDown" fluid>
          <div class="text-center">
            <v-btn
              color="primary"
              class="ma-2 text-xs-center"
              @click="newHealthReport"
            >
              {{ $t("Add report") }}
            </v-btn>
          </div>
          <template v-for="report in healthReports">
            <health-report-card
              :key="report._id"
              class="ma-2"
              :report="report"
              @updated="refresh"
            />
          </template>
          <div class="text-xs-center flex0">
            <v-pagination
              v-if="pagination.totalPages > 0"
              v-model="page"
              :length="pagination.totalPages"
            />
          </div>
        </v-container>

        <v-container v-if="!$vuetify.breakpoint.smAndDown" fluid class="parent">
          <v-row no-gutters>
            <v-col cols="4">
              <div class="flex-container elevation-1">
                <v-toolbar dark color="primary" class="flex0">
                  <v-btn text @click="newHealthReport">
                    <v-icon>mdi-plus</v-icon>
                    {{ $t("Add report") }}
                  </v-btn>
                </v-toolbar>
                <div class="flex1">
                  <v-list>
                    <v-list-item
                      v-for="report in healthReports"
                      :key="report._id"
                      @click="selectReport(report)"
                    >
                      <v-list-item-avatar>
                        <v-img :src="getIcon(report.weather)" contain />
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ report.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ formatDate(report.date) }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click.stop="editReport(report)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click.stop="deleteReport(report)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </div>
                <div class="text-xs-center flex0">
                  <v-pagination
                    v-if="pagination.totalPages > 0"
                    v-model="page"
                    :length="pagination.totalPages"
                  />
                </div>
              </div>
            </v-col>
            <v-col cols="8">
              <template v-if="selectedReport">
                <v-card class="flex-container-report">
                  <v-toolbar class="flex0" flat>
                    <v-avatar>
                      <v-img :src="getIcon(selectedReport.weather)" contain />
                    </v-avatar>
                    <v-toolbar-title class="ml-2">
                      {{ selectedReport.name }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click.stop="editReport(selectedReport)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click.stop="deleteReport(selectedReport)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-card-text class="flex1">
                    <div
                      class="tiptap-editor-view body-1 black--text"
                      v-html="selectedReport.description"
                    />
                    <task-list :tasks="tasks" />
                  </v-card-text>
                </v-card>
              </template>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      healthReports: [],
      page: 1,
      selectedReportForAction: null,
      selectedReport: null,
      tasks: null,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    page() {
      this.refresh();
    }
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.refresh();
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    refresh() {
      this.loading = true;
      Meteor.call(
        "healthReports.findHealthReports",
        {
          projectId: this.projectId,
          page: this.page
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();

          this.healthReports = result.data;
          if (this.selectedReport) {
            this.selectReport(this.selectedReport);
          }
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    newHealthReport() {
      this.$refs.newHealthReport.open();
    },
    getBackgroundUrl(user) {
      if (user && user.profile) {
        const { background } = user.profile;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
      return "";
    },

    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
    },

    editReport(report) {
      this.selectedReportForAction = report;
      this.$refs.editHealthReport.open();
    },
    deleteReport(report) {
      this.$confirm(this.$t("Confirm"), {
        title: this.$t("Deletion is permanent"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "healthReports.remove",
            {
              id: report._id
            },
            (error) => {
              this.$emit("updated");
              if (error) {
                this.$notifyError(error);
                return;
              }
              if (report._id === this.selectedReport?._id) {
                this.selectedReport = null;
              }
              this.$notify(this.$t("Report deleted"));
            }
          );
        }
      });
    },

    selectReport(report) {
      Meteor.call("healthReports.get", {
        healthReportId: report._id
      }, (error, result) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.selectedReport = result;
        this.refreshTasks(this.selectedReport);
      });
    },

    refreshTasks(report) {
      Meteor.call(
        "healthReports.findTasks",
        {
          id: report._id,
          page: 1
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.tasks = result.data;
        }
      );
    }
  }
};
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 32%;
  background-color: white;
}

.flex-container-report {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  background-color: white;
  width: 65.5%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

.empty {
  margin-top: 24px;
}

.parent {
  padding: 0 !important;
}

.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
}

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}
</style>
