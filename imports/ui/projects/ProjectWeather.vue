<template>
  <div class="project-weather">
    <new-health-report ref="newHealthReport" :projectId="projectId"></new-health-report>
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
                  <health-report-card :report="report"></health-report-card>
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
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  props: {
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