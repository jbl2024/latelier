<template>
  <div class="project-weather">
    <new-health-report ref="newHealthReport" :projectId="projectId"></new-health-report>
    <edit-health-report ref="editHealthReport" :report="selectedReport"></edit-health-report>
    <confirm-dialog
      :active.sync="showConfirmDelete"
      :title="$t('Confirm')"
      :content="$t('Deletion is permanent')"
      :confirm-text="$t('Delete')"
      :cancel-text="$t('Cancel')"
      @cancel="onCancelDelete"
      @confirm="onConfirmDelete"
    />

    <div v-if="!healthReports">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="healthReports">
      <empty-state
        class="empty"
        v-if="healthReports.length == 0"
        illustration="weather"
        :description="$t('No report defined')"
      >
        <v-btn class="info" @click="newHealthReport">{{ $t('Add report') }}</v-btn>
      </empty-state>

      <template v-if="healthReports.length > 0">
        <div class="container-wrapper" :style="getBackgroundUrl(user)">
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6 offset-sm3>
                <v-btn block @click="newHealthReport">{{ $t('Add report') }}</v-btn>
              </v-flex>
              <template v-for="report in healthReports">
                <v-flex xs12 sm6 offset-sm3 :key="report._id">
                  <v-card>
                    <v-layout row>
                      <v-flex xs7>
                        <v-card-title primary-title>
                          <div>
                            <div class="headline">{{ report.name }}</div>
                            <div>{{ formatDate(report.date) }}</div>
                          </div>
                        </v-card-title>
                      </v-flex>
                      <v-flex xs5>
                        <v-img :src="getIcon(report.weather)" height="125px" contain></v-img>
                      </v-flex>
                    </v-layout>
                    <v-card-text>
                      <div v-if="report.description" class="ql-editor-view" v-html="report.description"></div>
                    </v-card-text>
                    <v-divider light></v-divider>

                    <v-card-actions class="pa-3" color="white">
                      <v-spacer></v-spacer>
                      <v-btn icon @click="editReport(report)">
                        <v-icon>edit</v-icon>
                      </v-btn>
                      <v-btn icon @click="deleteReport(report)">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-flex>
              </template>
            </v-layout>
          </v-container>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import { Backgrounds } from '/imports/api/backgrounds/backgrounds.js'
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
    this.$store.dispatch("setCurrentOrganizationId", 0);
  },
  props: {
    organizationId: {
      type: String,
      default: "0"
    },
    projectId: {
      type: String,
      default: "0"
    }
  },
  i18n: {
    messages: {
      en: {
        "No report defined": "No report defined",
        "Add report": "Add report"
      },
      fr: {
        "No report defined": "Aucun bulletin disponible",
        "Add report": "Ajouter un bulletin"
      }
    }
  },
  data() {
    return {
      showConfirmDelete: false,
      selectedReport: null
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      healthReports: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
    },
    healthReports() {
      return HealthReports.find({}, { sort: { date: -1 } });
    },
    currentReport() {
      return HealthReports.findOne({}, { sort: { date: -1 } });
    },
    user () {
      return Meteor.user();
    }

  },
  methods: {
    newHealthReport() {
      this.$refs.newHealthReport.open();
    },
    editReport(report) {
      this.selectedReport = report;
      this.$refs.editHealthReport.open();
    },
    deleteReport(report) {
      this.selectedReport = report;
      this.showConfirmDelete = true;
    },
    onCancelDelete() {},
    onConfirmDelete() {
      Meteor.call("healthReports.remove", this.selectedReport._id);
    },
    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
    },
    getBackgroundUrl(user) {
      if (user && user.profile) {
        const background = user.profile.background;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
    },

  }
};
</script>

<style scoped>
.empty {
  margin-top: 24px;
}

.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  position: relative;
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