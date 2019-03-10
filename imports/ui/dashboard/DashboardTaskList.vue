<template>
  <div class="dashboard-task-list">
    <v-list two-line dense>
      <template v-for="task in tasks">
        <v-list-tile :key="task._id" @click="openTask(task)">
          <v-list-tile-content>
            <v-list-tile-title>{{ task.name }}</v-list-tile-title>
            <v-list-tile-sub-title>
              {{ task.project.name}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "dashboard-task-list",
  mixins: [DatesMixin],
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
    }
  }
};
</script>

<style scoped>
</style>