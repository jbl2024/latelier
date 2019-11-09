<template>
  <v-card class="mx-auto search-results" outlined>
    <v-progress-linear v-if="loading" indeterminate />
    <v-tabs v-if="filter" v-model="tab" grow show-arrows>
      <v-tabs-slider color="accent" />
      <v-tab id="tab-properties">
        {{ $t("Tasks") }}
      </v-tab>
      <v-tab id="tab-projects">
        {{ $t("Projects") }}
      </v-tab>
      <v-tab id="tab-organizations">
        {{ $t("Organizations") }}
      </v-tab>
      <v-tab id="tab-users">
        {{ $t("Users") }}
      </v-tab>

      <v-tab-item>
        <task-list :tasks="tasks" @select="onSelectTask" />
        <div class="text-xs-center">
          <v-pagination
            v-if="pagination.totalPages > 0"
            v-model="page"
            :length="pagination.totalPages"
          />
        </div>
      </v-tab-item>
      <v-tab-item> 2 {{ tab }} </v-tab-item>
      <v-tab-item>
        {{ tab }}
      </v-tab-item>
      <v-tab-item>
        {{ tab }}
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    filter: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      tab: 0,
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
    ...mapState(["currentProjectId"])
  },
  watch: {
    page() {
      this.find();
    },
    tab() {
      this.find();
    },
    filter: {
      immediate: true,
      handler() {
        this.find();
      }
    }
  },
  methods: {
    find() {
      const methods = [
        this.findTasks,
        this.findProjects,
        this.findOrganizations,
        this.findUsers
      ];
      methods[this.tab || 0].apply(this);
    },
    findTasks() {
      if (!this.filter || !this.filter.length === 0) return;
      this.loading = true;
      Meteor.call(
        "search.findTasks",
        {
          name: this.filter,
          projectId: this.currentProjectId,
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

          this.tasks = result.data;
          this.taskCount = result.data.totalItems;
        }
      );
    },
    findProjects() {
      /* eslint no-console: off */
      console.log("findProjects");
    },

    findOrganizations() {
      /* eslint no-console: off */
      console.log("findOrganizations");
    },

    findUsers() {
      /* eslint no-console: off */
      console.log("findUsers");
    },

    calculateTotalPages() {
      if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
        return 0;
      }
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    onSelectTask(task) {
      if (!task) return;
      this.$router.push({
        name: "project-task",
        params: {
          projectId: task.projectId,
          taskId: task._id
        }
      });
      this.$emit("update:active", false);
    }
  }
};
</script>

<style scoped></style>
