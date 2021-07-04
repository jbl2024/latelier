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
import { mapState } from "vuex";

export default {
  name: "DashboardTaskList",
  props: {
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
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
  computed: {
    ...mapState(["showArchivedProjects"])
  },
  watch: {
    organizationId() {
      this.refresh();
    },
    showArchivedProjects() {
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
        this.type,
        this.organizationId,
        this.projectId,
        1,
        this.showArchivedProjects,
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
.empty-state {
  margin-top: 24px;
}
</style>
