<template>
  <div class="tasks">
    <div class="tasks-title">
      {{ $t("Tasks") }}
    </div>
    <v-divider />
    <v-tabs v-model="tab">
      <v-tab>{{ $t("Recents") }}</v-tab>
      <v-tab>{{ $t("My tasks") }}</v-tab>
      <v-tab>{{ $t("Late") }}</v-tab>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="recent"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="assignedToMe"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="late"
          empty-illustration="celebration"
          :organization-id="organizationId"
        />
      </v-tab-item>
    </v-tabs>
  </div>
</template>
<script>
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";

export default {
  components: {
    DashboardTaskList
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
      tab: null
    };
  }
};
</script>
<style scoped>
.tasks-title {
  margin: 1rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.08em;
  flex: 0;
}
</style>
