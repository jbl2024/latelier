<template>
  <div class="dashboard-task-list">
    <v-progress-linear v-if="loading" indeterminate />
    <task-list
      v-if="tasks && !loading"
      :tasks="tasks"
      :empty-illustration="emptyIllustration"
    />
  </div>
</template>

<script>
export default {
  name: "DashboardTaskList",
  props: {
    organizationId: {
      type: String,
      default: ""
    },
    user: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: "recent"
    },
    emptyIllustration: {
      type: String,
      default: "empty"
    }
  },
  data() {
    return {
      loading: true,
      tasks: null
    };
  },
  watch: {
    organizationId() {
      this.refresh();
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      Meteor.call(
        "dashboards.findTasks",
        this.user,
        this.type,
        this.organizationId,
        1,
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
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
.empty-state {
  margin-top: 24px;
}
</style>
