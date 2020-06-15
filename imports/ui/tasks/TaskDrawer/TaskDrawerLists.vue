<template>
  <div>
    <!-- Lists of task (Recent|AssignedToMe|Late) -->
    <dashboard-task-list
      v-for="taskList in taskLists"
      :key="key(taskList.type)"
      :type="taskList.type"
      :organization-id="organizationId"
      :project-id="projectId"
    >
      <template #tasks="data">
        <drawer-mini-list
          :is-expanded.sync="taskList.isExpanded"
          :items-per-page="taskList.itemsPerPage"
          :items="data.tasks"
          :header="taskList.text"
          :selected-color="selectedTaskColor"
          :selected-task="selectedTask"
        >
          <!-- Task items -->
          <template #items="props">
            <task-drawer-list-item
              v-for="task in props.items"
              :key="`${key(taskList.type)}-${task._id}`"
              :selected="selectedTaskId === task._id"
              :selected-color="selectedTaskColor"
              :task="task"
            />
          </template>
        </drawer-mini-list>
      </template>
    </dashboard-task-list>
  </div>
</template>
<script>
import DrawerMiniList from "/imports/ui/ui/DrawerMiniList";
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import TaskDrawerListItem from "/imports/ui/tasks/TaskDrawer/TaskDrawerListItem";
import { mapState } from "vuex";

export default {
  components: {
    DashboardTaskList,
    TaskDrawerListItem,
    DrawerMiniList
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      taskLists: [
        {
          type: "assignedToMe",
          text: this.$t("tasks.assignedToMe"),
          itemsPerPage: 5,
          isExpanded: false
        },
        {
          type: "recent",
          text: this.$t("tasks.recent"),
          itemsPerPage: 5,
          isExpanded: true
        },
        {
          type: "late",
          text: this.$t("tasks.late"),
          itemsPerPage: 5,
          isExpanded: false
        }
      ]
    };
  },
  computed: {
    ...mapState(["selectedTask"]),
    ...mapState("ui", ["navigationColor"]),
    selectedTaskId() {
      return this.selectedTask?._id;
    },
    selectedTaskColor() {
      return this.navigationColor
        ? this.navigationColor
        : this.$vuetify.theme.currentTheme.accent;
    },
    key() {
      return function (type) {
        return [this.projectId, this.organizationId, type]
          .filter((part) => part)
          .join("-");
      };
    }
  }
};
</script>
