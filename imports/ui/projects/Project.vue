<template>
  <div class="project">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </div>

    <div v-if="$subReady.project" class="project-wrapper">
      <div class="container-wrapper" :style="getBackgroundUrl(user)">
        <project-toolbar
          :user="user"
          :project="project"
          class="flex0"
        />
        <kanban
          ref="container"
          class="kanban-container flex1"
          :project-id="projectId"
          :add-margin="showTaskDetail"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

import debounce from "lodash/debounce";
import { mapState } from "vuex";

export default {
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
    ...mapState(["showTaskDetail"])
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
        this.$store.dispatch("setCurrentProjectId", this.projectId);
      }
    }
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$events.listen("close-task-detail", () => {
      if (!this.$store.state.showTaskDetail) return;

      this.$store.dispatch("selectTask", null);
      this.$store.dispatch("showTaskDetail", false);
      this.$router.push({
        name: "project",
        params: {
          organizationId: this.organizationId,
          projectId: this.projectId
        }
      });
    });
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
    this.$events.off("close-task-detail");
    this.$store.dispatch("setCurrentProjectId", null);
    this.$store.dispatch("selectTask", null);
    this.$store.dispatch("showTaskDetail", false);
  },

  meteor: {
    // Subscriptions
    $subscribe: {
      project() {
        return [this.projectId];
      },
      user() {
        return [];
      }
    },
    project() {
      if (this.taskId) {
        this.selectTask(this.taskId);
      }
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("setWindowTitle", project.name);
      }
      return project;
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    selectTask(taskId) {
      const selectedTask = Tasks.findOne({ _id: taskId });
      if (selectedTask) {
        this.$store.dispatch("selectTask", selectedTask);
        this.$store.dispatch("showTaskDetail", true);
      }
    },

    hasBackground() {
      return this.getBackgroundUrl();
    },

    getBackgroundUrl(user) {
      if (user && user.profile) {
        const { background } = user.profile;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
      return null;
    },

    deleteTask(task) {
      this.$confirm(this.$t("Do you really want to delete this task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Move to trash")
      }).then((res) => {
        if (res) {
          Meteor.call("tasks.remove", task._id);
          this.$events.fire("close-task-detail");
        }
      });
    }
  }
};
</script>

<style scoped>
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}

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

.container-wrapper {
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}
</style>
