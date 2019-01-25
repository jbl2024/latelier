<template>
  <div class="project-weather">
    <new-health-report ref="newHealthReport" :projectId="projectId"></new-health-report>

    <div v-if="!healthReports">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="healthReports">
      <empty-state
        v-if="healthReports.length == 0"
        illustration="weather"
        :description="$t('No report defined')"
      >
        <v-btn class="info" @click="newHealthReport">{{ $t('Add report') }}</v-btn>
      </empty-state>

      <template v-if="healthReports.length > 0">
        <div>
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
                            <div class="headline">{{ projectProgress }}%</div>
                            <div>Du {{ formatDate(report.startDate) }} au {{ formatDate(report.endDate) }}</div>
                          </div>
                        </v-card-title>
                      </v-flex>
                      <v-flex xs5>
                        <v-img src="/weather/sunny.svg" height="125px" contain></v-img>
                      </v-flex>
                    </v-layout>
                    <v-divider light></v-divider>
                    <v-card-actions class="pa-3" color="white">
                      <v-progress-linear v-model="projectProgress" dark></v-progress-linear>
                      <v-spacer></v-spacer>
                      <v-btn icon>
                        <v-icon>edit</v-icon>
                      </v-btn>
                      <v-btn icon>
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
      projectProgress: 80
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
      return HealthReports.find({}, { sort: { endDate: -1 } });
    },
    currentReport() {
      return HealthReports.findOne({}, { sort: { endDate: -1 } });
    }
  },
  methods: {
    newHealthReport() {
      this.$refs.newHealthReport.open();
    }
  }
};
</script>

<style scoped>
</style>