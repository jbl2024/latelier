<template>
  <div class="tasks">
    <draggable group="tasks" @end="onEnd" v-model="dndTasks" @change="onChange">
      <div v-for="task in tasks" :key="task._id">
        <task :task="task" class="task" v-if="showCompleted(task, showHiddenTasks)"></task>
      </div>
    </draggable>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { mapState } from "vuex";
import draggable from "vuedraggable";

export default {
  components: {
    draggable
  },
  mounted() {
    this.$events.listen("filter-tasks", name => {
      this.filterName = name;
    });
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
  },
  props: {
    projectId: {
      type: String,
      default: "0"
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
  computed: {
    ...mapState("projectFilters", {
      selectedLabels: state => state.selectedLabels,
      selectedAssignedTos: state => state.selectedAssignedTos,
      selectedUpdatedBy: state => state.selectedUpdatedBy
    })
  },
  data() {
    return {
      filterName: "",
      dndTasks: []
    };
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
        var query = {
          listId: this.listId
        };

        if (name && name.length > 0) {
          query.name = {
            $regex: ".*" + name + ".*",
            $options: "i"
          };
        }

        if (labels && labels.length > 0) {
          query.labels = {
            $in: labels.map(label => {
              return label._id;
            })
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

        const tasks = Tasks.find(query, { sort: { order: 1 } }).fetch();
        this.dndTasks = tasks;
        return tasks;
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
      var that = this;
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

    onEnd(event) {},

    onChange(event) {
      console.log(event)
      const { added, moved } = event;
      let newIndex = 0;
      let element;
      if (added) {
        newIndex = added.newIndex;
        element = added.element;
      } else if (moved) {
        newIndex = moved.newIndex;
        element = moved.element;
      } else {
        return;
      }
      let order = -1;
      if (newIndex <= this.dndTasks.length && newIndex > 0) {
        order = this.dndTasks[newIndex - 1].order + 1;
      }

      Meteor.call(
        "tasks.move",
        this.projectId,
        this.listId,
        element._id,
        order
      );
    }
  }
};
</script>

<style scoped>
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