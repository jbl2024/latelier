<template>
  <div class="project-weather">
    <new-health-report ref="newHealthReport" :projectId="projectId" @created="refresh"></new-health-report>
    <empty-state
      class="empty"
      v-if="healthReports.length == 0 && !loading"
      illustration="weather"
      :description="$t('No report defined')"
    >
      <v-btn class="info" @click="newHealthReport">{{ $t('Add report') }}</v-btn>
    </empty-state>

    <template v-if="healthReports.length > 0">
      <div v-resize="onResize" ref="container" class="container-wrapper" :style="getBackgroundUrl(user)">
        <div v-if="loading">
          <v-progress-linear indeterminate></v-progress-linear>
        </div>
        <v-container fluid grid-list-lg>
          <v-layout row wrap >
            <v-flex xs12 :md6="!narrow" :offset-md3="!narrow">
              <v-btn color="primary" :class="{'cards-narrow': narrow }" @click="newHealthReport">{{ $t('Add report') }}</v-btn>
            </v-flex>
            <template v-for="report in healthReports">
              <v-flex :key="report._id" xs12 :md6="!narrow" :offset-md3="!narrow" >
                <health-report-card :class="{'cards-narrow': narrow }" :report="report" @updated="refresh"></health-report-card>
              </v-flex>
            </template>
          </v-layout>
        </v-container>
        <div class="text-xs-center" v-if="pagination.totalPages > 1">
          <v-pagination
            v-if="pagination.totalPages > 0"
            v-model="page"
            :length="pagination.totalPages"
          ></v-pagination>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import { Backgrounds } from "/imports/api/backgrounds/backgrounds.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.refresh();
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
  watch: {
    page(page) {
      this.refresh();
    }
  },
  data() {
    return {
      loading: false,
      healthReports: [],
      page: 1,
      narrow: false,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
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
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();

          this.healthReports = result.data;
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

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

    onResize() {
      const width = this.$refs.container.offsetWidth;
      console.log(width)
      if (width < 780 && width > 600) {
        this.narrow = true;
      } else {
        this.narrow = false;
      }

    }
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

.cards-wide {
  /* margin-left: 256px;
  margin-right: 256px; */
}

.cards-narrow {
  margin-left: 64px;
  margin-right: 64px;
}

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}
</style>