<template>
  <v-card class="search-results">
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
        {{ $t("Tasks") }}
      </v-tab>
      <v-tab>
        {{ $t("Projects") }}
      </v-tab>
      <v-tab-item>
        <search-tasks
          :project-id="currentProjectId"
          :organization-id="currentOrganizationId"
          :filter="filterTasks"
          @select="onSelectTask"
        />
      </v-tab-item>
      <v-tab-item>
        <search-projects
          :organization-id="currentOrganizationId"
          :filter="filterProjects"
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
    }
  },
  data() {
    return {
      tab: 0,
      filterTasks: "",
      filterProjects: "",
      filterOrganizations: "",
      filterUsers: ""
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
      switch (this.tab) {
        case 0:
          this.filterTasks = this.filter;
          break;
        case 1:
          this.filterProjects = this.filter;
          break;
        default:
          this.filterTasks = this.filter;
      }
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
