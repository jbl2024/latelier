<template>
  <v-card>
    <edit-health-report ref="editHealthReport" :report="selectedReport"></edit-health-report>
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
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    report: Object
  },
  data() {
    return {
      showConfirmDelete: false,
      selectedReport: null
    }
  },
  methods: {
    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
    },
    editReport(report) {
      this.selectedReport = report;
      this.$refs.editHealthReport.open();
    },
    deleteReport(report) {
      this.$confirm(this.$t("Confirm"), {
        title: this.$t('Deletion is permanent'),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("healthReports.remove", this.selectedReport._id, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t('Report deleted'));
          });
        }
      });
    }
  }
};
</script>

<style scoped>
</style>