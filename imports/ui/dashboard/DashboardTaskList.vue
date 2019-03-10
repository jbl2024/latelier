<template>
  <div class="dashboard-task-list">
    <v-list three-line v-if="tasks">
      <empty-state v-if="tasks.length == 0" illustration="empty" small :label="$t('No task')"></empty-state>

      <template v-for="task in tasks">
        <v-list-tile :key="task._id" @click="openTask(task)" avatar>
          <v-list-tile-avatar :color="isOnline(task.assignedTo)">
            <span class="">{{ formatUserLetters(task.assignedTo) }}</span>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ task.name }}</v-list-tile-title>
            <v-list-tile-sub-title>
              {{ task.project.name}}
            </v-list-tile-sub-title>
            <v-list-tile-sub-title>
              <template v-if="task.dueDate && isLate(task)">
                Est arrivée à échéance <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
              <template v-if="task.dueDate && !isLate(task)">
                Arrive à échéance <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider inset :key="task._id"></v-divider>
      </template>
    </v-list>
  </div>
</template>

<script>
import UsersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "dashboard-task-list",
  mixins: [UsersMixin, DatesMixin],
  mounted() {
    Meteor.call(
      "dashboards.findTasks",
      this.user,
      this.type,
      1,
      (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.tasks = result.data;
      }
    );
  },
  props: {
    user: {
      type: Object
    },
    type: {
      type: String,
      default: "recent"
    }
  },
  data() {
    return {
      tasks: null
    };
  },
  methods: {
    openTask(task) {
      this.$router.push({
        name: "project-task",
        params: {
          organizationId: task.project.organizationId,
          projectId: task.projectId,
          taskId: task._id
        }
      });
    },

    isLate(task) {
      return task.dueDate && task.dueDate <= new Date();
    }
  }
};
</script>

<style scoped>
.empty-state {
  margin-top: 24px;
}
</style>