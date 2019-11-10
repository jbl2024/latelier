<template>
  <div ref="tasks" class="tasks dragscroll">
    <template v-for="task in tasks">
      <task
        v-if="showCompleted(task, showHiddenTasks)"
        :key="task._id"
        :task="task"
        class="task"
        :data-id="task._id"
      />
    </template>
  </div>
</template>

<script>
import { Tasks } from "/imports/api/tasks/tasks.js";
import { mapState } from "vuex";
import * as Sortable from "sortablejs";

export default {
  props: {
    projectId: {
      type: String,
      default: null
    },
    listId: {
      type: String,
      default: "0"
    },
    showHiddenTasks: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterName: "",
      sortable: null
    };
  },
  computed: {
    ...mapState("projectFilters", {
      selectedLabels: (state) => state.selectedLabels,
      selectedAssignedTos: (state) => state.selectedAssignedTos,
      selectedUpdatedBy: (state) => state.selectedUpdatedBy
    })
  },
  mounted() {
    this.$events.listen("filter-tasks", (name) => {
      this.filterName = name;
    });

    const options = {
      delayOnTouchOnly: true,
      delay: 250,
      animation: 150,
      group: "tasks",
      onUpdate: (event) => {
        this.handleMove(event);
      },
      onAdd: (event) => {
        this.handleMove(event);
      }
    };
    this.sortable = Sortable.create(this.$refs.tasks, options);
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
    this.sortable.destroy();
  },
  meteor: {
    $subscribe: {},
    tasks: {
      params() {
        return {
          name: this.filterName,
          labels: this.selectedLabels,
          assignedTos: this.selectedAssignedTos,
          updatedBy: this.selectedUpdatedBy
        };
      },
      deep: false,
      update({ name, labels, assignedTos, updatedBy }) {
        const query = {
          listId: this.listId
        };

        if (name && name.length > 0) {
          query.name = {
            $regex: `.*${name}.*`,
            $options: "i"
          };
        }

        if (labels && labels.length > 0) {
          query.labels = {
            $in: labels.map((label) => label._id)
          };
        }

        if (assignedTos && assignedTos.length > 0) {
          query.assignedTo = {
            $in: assignedTos
          };
        }

        if (updatedBy && updatedBy.length > 0) {
          query.updatedBy = {
            $in: updatedBy
          };
        }

        return Tasks.find(query, { sort: { order: 1 } });
      }
    }
  },
  methods: {
    showCompleted(task, show) {
      if (task.completed && !show) {
        return false;
      }
      return true;
    },

    newTaskInline() {
      Meteor.call(
        "tasks.insert",
        this.projectId,
        this.listId,
        "Nouvelle tâche",
        (error, task) => {
          if (error) {
            return;
          }
          this.$events.fire("task-edit-name", task);
        }
      );
    },
    deleteTask(taskId) {
      Meteor.call("tasks.remove", taskId);
    },

    handleMove(event) {
      const taskId = event.item.dataset.id;
      const index = event.newIndex;
      if (index < this.tasks.length) {
        const nextTask = this.tasks[index];
        Meteor.call(
          "tasks.move",
          this.projectId,
          this.listId,
          taskId,
          nextTask.order - 1
        );
      } else {
        Meteor.call("tasks.move", this.projectId, this.listId, taskId);
      }
    }
  }
};
</script>

<style scoped>
@media (min-width: 601px) {
  .tasks {
    min-height: 400px;
  }
}

.task {
  margin-top: 6px;
  margin-bottom: 6px;
}
.task h2 {
  text-align: left;
  background-color: #2d6293;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}

.drag-image .task {
  width: 272px;
}
</style>
