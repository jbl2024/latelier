<template>
  <div class="project">
    <div v-if="!currentProject">
      <v-progress-linear indeterminate />
    </div>
    <div v-else class="project-wrapper">
      <div class="container-wrapper" :style="getBackgroundUrl(currentUser)">
        <project-toolbar
          :user="currentUser"
          :project="currentProject"
        />
        <kanban
          ref="container"
          class="kanban-container flex1"
          :project-id="projectId"
        />
      </div>
    </div>
  </div>
</template>

<script>

import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import debounce from "lodash/debounce";
import { mapState } from "vuex";

export default {
  mixins: [BackgroundMixin],
  props: {
    projectId: {
      type: String,
      default: null
    },
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      savedProjectName: "",
      editProjectName: false,
      debouncedFilter: "",
      showDeleteTaskDialog: false
    };
  },
  computed: {
    ...mapState("project", ["currentProject"]),
    ...mapState(["currentUser", "showTaskDetail"])
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      if (this.taskId) {
        this.selectTask(this.taskId);
      }
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
        this.$store.dispatch("setWindowTitle", project.name);
      }
      return project;
    }
  },
  watch: {
    taskId: {
      immediate: true,
      handler(taskId) {
        if (taskId) {
          this.selectTask(taskId);
        }
      }
    },
    projectId: {
      handler() {
        this.$store.dispatch("project/setCurrentProjectId", this.projectId);
      }
    },
    showTaskDetail(now, prev) {
      if (!now && prev) {
        this.$store.dispatch("selectTask", null);
        this.$router.push({
          name: "project",
          params: {
            organizationId: this.organizationId,
            projectId: this.projectId
          }
        });
      }
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    this.$events.listen("delete-task", (task) => {
      this.deleteTask(task);
    });
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.$events.fire("filter-tasks", val);
    }, 400);
  },
  beforeDestroy() {
    this.$events.off("delete-task");
    this.$store.dispatch("project/setCurrentProjectId", null);
    this.$store.dispatch("selectTask", null);
    this.$store.dispatch("showTaskDetail", false);
  },
  methods: {
    selectTask(taskId) {
      const selectedTask = Tasks.findOne({ _id: taskId });
      if (selectedTask) {
        this.$store.dispatch("selectTask", selectedTask);
        this.$store.dispatch("showTaskDetail", true);
      }
    },
    deleteTask(task) {
      this.$confirm(this.$t("Do you really want to delete this task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Move to trash")
      }).then((res) => {
        if (res) {
          Meteor.call("tasks.remove", task._id);
          this.$store.dispatch("showTaskDetail", false);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

@import '/imports/ui/styles/mixins/scrollbar';

@include scrollbar;


.project {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
}

.project-wrapper {
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex: 1;
  position: relative;
}

@media (max-width: 600px) {
  .kanban-container {
    margin: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 601px) {
  .kanban-container {
    margin: 4px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: scroll;
    padding-left: 4px;
    height: 100%;
  }
}

.kanban-container {
  margin-top: 1rem;
}

.container-wrapper {
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  @media (max-width: 600px) {
    min-height: 100vh;
  }
}

</style>
