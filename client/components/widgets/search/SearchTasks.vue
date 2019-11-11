<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <task-list :tasks="tasks" @select="onSelectTask" />
    <div class="text-xs-center">
      <v-pagination
        v-if="pagination.totalPages > 0"
        v-model="page"
        :total-visible="5"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filter: {
      type: String,
      default: ""
    },
    projectId: {
      type: String,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      tasks: [],
      taskCount: 0,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    page() {
      this.find();
    },
    filter: {
      immediate: true,
      handler() {
        if (this.page !== 1) {
          this.page = 1;
        } else {
          this.find();
        }
      }
    }
  },
  methods: {
    find() {
      if (!this.filter || !this.filter.length === 0) return;
      this.loading = true;
      Meteor.call(
        "search.findTasks",
        {
          name: this.filter,
          projectId: this.projectId,
          organizationId: this.organizationId,
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
          this.pagination.totalPages = result.totalPages;

          this.tasks = result.data;
          this.taskCount = result.totalItems;
          this.$emit("update:taskCount", this.taskCount);
        }
      );
    },

    onSelectTask(task) {
      this.$emit("select", task);
    }
  }
};
</script>

<style scoped></style>
