<template>
  <DynamicScroller
    v-if="tasks.length > 0"
    ref="tasks"
    :items="tasks"
    :min-item-size="54"
    key-field="_id"
    class="scroller tasks"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.name]"
        :data-index="index"
      >
        <task
          v-if="showCompleted(item, showHiddenTasks)"
          :key="item._id"
          :task="item"
          class="task"
          :data-id="item._id"
        />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script>
import { Tasks } from "/imports/api/tasks/tasks.js";
import { mapState } from "vuex";
import { devices } from "/imports/devices";
import Sortable from "sortablejs";

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
    ...mapState("project/filters", {
      selectedLabels: (state) => state.selectedLabels,
      selectedAssignedTos: (state) => state.selectedAssignedTos,
      selectedUpdatedBy: (state) => state.selectedUpdatedBy
    })
  },
  mounted() {
    this.$events.listen("filter-tasks", (name) => {
      this.filterName = name;
    });

    let options = {
      delayOnTouchOnly: true,
      delay: 250,
      // animation: 150,
      animation: 0,
      group: {
        name: "tasks",
        pull: "clone"
      },
      onUpdate: (event) => {
        this.handleMove(event);
      },
      onAdd: (event) => {
        this.handleMove(event);
      }
    };

    if (true) {
      options = {
        ...options,
        forceFallback: true,
        fallbackTolerance: 4,
        touchStartThreshold: 4
      };
    }
    this.$nextTick(() => {
      if (!this.$refs.tasks) {
        return;
      }
      const el = this.$refs.tasks.$el.querySelector(".vue-recycle-scroller__item-wrapper");
      this.sortable = Sortable.create(el, options);
    });

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
      const taskId = event.item.firstChild.firstChild.dataset.id;
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

<style lang="scss" scoped>
.tasks {
  @media (min-width: 601px) {
    min-height: 400px;
  }
}
.drag-image .task {
  width: 272px;
}
.scroller {
  height: 100%;
}
</style>
