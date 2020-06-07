<template>
  <dashboard-task-list
    :key="key('recent')"
    type="recent"
    :organization-id="organizationId"
    :project-id="projectId"
  >
    <template #tasks="data">
      <task-drawer-list
        :tasks="data.tasks"
      />
    </template>
  </dashboard-task-list>
</template>
<script>
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import TaskDrawerList from "/imports/ui/tasks/TaskDrawerList";

export default {
  components: {
    DashboardTaskList,
    TaskDrawerList
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
      taskTab: null
    };
  },
  computed: {
    key() {
      return function(type) {
        return [this.projectId, this.organizationId, type].filter((part) => part).join("-");
      };
    }
  }
};
</script>
