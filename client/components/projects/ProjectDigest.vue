<template>
  <div>
    <template v-if="day">
      <h2>Since yesterday</h2>
      <template v-if="day.tasks.created.length > 0">
        <v-subheader>{{ $t('New tasks') }}</v-subheader>
        <task-list :tasks="day.tasks.created"/>
      </template>
      <template v-if="day.tasks.updated.length > 0">
        <v-subheader>{{ $t('Updated tasks') }}</v-subheader>
        <task-list :tasks="day.tasks.updated" />
      </template>
      <template v-if="day.tasks.deleted.length > 0">
        <v-subheader>{{ $t('Deleted tasks') }}</v-subheader>
        <task-list :tasks="day.tasks.deleted" />
      </template>
    </template>
    <v-divider />
    <template v-if="lastWeek">
      <h2>Last week</h2>
      <v-subheader>{{ $t('New tasks') }}</v-subheader>
      <task-list :tasks="lastWeek.tasks.created" />
      <v-subheader>{{ $t('Updated tasks') }}</v-subheader>
      <task-list :tasks="lastWeek.tasks.updated" />
      <v-subheader>{{ $t('Deleted tasks') }}</v-subheader>
      <task-list :tasks="lastWeek.tasks.deleted" />
    </template>
  </div>
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from "moment";

export default {
  mixins: [DatesMixin],
  props: {
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      day: null,
      lastWeek: null
    };
  },
  watch: {
    projectId: {
      immediate: true,
      handler(projectId) {
        if (projectId) {
          this.refresh();
        }
      }
    }
  },
  methods: {
    get1Day() {
      const startDate = moment()
        .add(-1, "days")
        .startOf("day")
        .toDate();
      const endDate = moment().toDate();

      Meteor.call(
        "digest.generate",
        {
          projectId: this.projectId,
          startDate: startDate,
          endDate: endDate
        },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.day = result;
        }
      );
    },

    getLastWeek() {
      const startDate = moment()
        .add(-1, "weeks")
        .startOf("day")
        .toDate();
      const endDate = moment()
        .add(-1, "days")
        .startOf("day")
        .toDate();

      Meteor.call(
        "digest.generate",
        {
          projectId: this.projectId,
          startDate: startDate,
          endDate: endDate
        },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.lastWeek = result;
        }
      );
    },

    refresh() {
      this.get1Day();
      this.getLastWeek();
    }
  }
};
</script>

<style lang="scss" scoped></style>
