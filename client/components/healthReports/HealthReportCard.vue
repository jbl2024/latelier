<template>
  <v-card @click="show = !show" class="card">
    <edit-health-report ref="editHealthReport" :report="selectedReport" @updated="$emit('updated')"></edit-health-report>
    <v-card-title primary-title>
      <div>
        <div class="headline">{{ report.name }}</div>
        <div>{{ formatDate(report.date) }}</div>
      </div>
    </v-card-title>
    <v-img :src="getIcon(report.weather)" height="125px" contain></v-img>
    <v-card-text>
      <div v-if="report.description" class="ql-editor-view" v-html="report.description"></div>
    </v-card-text>
    <v-divider light></v-divider>

    <v-card-actions color="white">
      <v-btn icon @click.stop="editReport(report)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon @click.stop="deleteReport(report)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="show = !show">
        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-actions>
    <v-slide-y-transition>
      <v-card-text v-show="show">
        <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
        <task-list :tasks="tasks"></task-list>
      </v-card-text>
    </v-slide-y-transition>
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
      show: false,
      loading: false,
      showConfirmDelete: false,
      selectedReport: null,
      tasks: null,
      taskCount: 0,
    };
  },
  watch: {
    show(show) {
      if (show) {
        this.loading = true;
        this.refreshTasks();
      }
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
        title: this.$t("Deletion is permanent"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call(
            "healthReports.remove",
            report._id,
            (error, result) => {
              this.$emit("updated");
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Report deleted"));
            }
          );
        }
      });
    },

    refreshTasks() {
      Meteor.call(
        "healthReports.findTasks",
        {
          id: this.report._id,
          page: 1
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.tasks = result.data;
          this.taskCount = result.data.totalItems;
        }
      );
    }
  }
};
</script>

<style scoped>
.card {
  cursor: pointer;
}
</style>