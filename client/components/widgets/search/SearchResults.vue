<template>
  <v-card class="search-results" :width="width">
    <v-tabs
      v-if="filter"
      v-model="tab"
      grow
      show-arrows
      light
      background-color="white"
      class="tabs"
    >
      <v-tabs-slider color="accent" />
      <v-tab>
        {{ $t("Tasks") }} ({{ taskCount }})
      </v-tab>
      <v-tab>
        {{ $t("Projects") }} ({{ projectCount }})
      </v-tab>
      <v-tab-item eager>
        <search-tasks
          :project-id="currentProjectId"
          :organization-id="currentOrganizationId"
          :filter="filterTasks"
          :task-count.sync="taskCount"
          @select="onSelectTask"
        />
      </v-tab-item>
      <v-tab-item eager>
        <search-projects
          :organization-id="currentOrganizationId"
          :filter="filterProjects"
          :project-count.sync="projectCount"
          @select="onSelectProject"
        />
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
    },
    width: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tab: 0,
      filterTasks: "",
      filterProjects: "",
      filterOrganizations: "",
      filterUsers: "",
      taskCount: 0,
      projectCount: 0
    };
  },
  computed: {
    ...mapState(["currentProjectId", "currentOrganizationId"])
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
      this.filterTasks = this.filter;
      this.filterProjects = this.filter;
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
    },

    onSelectProject(project) {
      if (!project) return;
      this.$router.push({
        name: "project",
        params: {
          projectId: project._id
        }
      });
      this.$emit("update:active", false);
    }
  }
};
</script>

<style scoped>
.tabs {
  border-radius: 0px !important;
}
</style>
