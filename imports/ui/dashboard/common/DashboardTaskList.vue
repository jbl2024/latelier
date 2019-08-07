<template>
  <div class="dashboard-task-list">
    <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
    <task-list :tasks="tasks" :empty-illustration="emptyIllustration" v-if="tasks && !loading"></task-list>
  </div>
</template>

<script>
export default {
  name: "dashboard-task-list",
  mounted() {
    this.refresh();
  },
  props: {
    organizationId: {
      type: String
    },
    user: {
      type: Object
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
  watch: {
    organizationId(organizationId) {
      this.refresh();
    }
  },
  data() {
    return {
      loading: true,
      tasks: null
    };
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