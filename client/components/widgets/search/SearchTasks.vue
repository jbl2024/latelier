<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <task-list :tasks="tasks" @select="onSelectTask" />
    <div class="text-xs-center">
      <v-pagination
        v-if="pagination.totalPages > 1"
        v-model="page"
        :total-visible="5"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

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
  computed: {
    ...mapState(["showArchivedProjects"])
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
    async find() {
      if (!this.filter || !this.filter.length === 0) return;
      this.loading = true;
      try {
        const result = await Meteor.callAsync("search.findTasks", {
          name: this.filter,
          projectId: this.projectId,
          organizationId: this.organizationId,
          page: this.page,
          showArchivedProjects: this.showArchivedProjects
        });
        this.loading = false;
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = result.totalPages;

        this.tasks = result.data;
        this.taskCount = result.totalItems;
        this.$emit("update:taskCount", this.taskCount);
      } catch (error) {
        this.loading = false;
        this.$notifyError(error);
      }
    },

    onSelectTask(task) {
      this.$emit("select", task);
    }
  }
};
</script>

<style scoped></style>
