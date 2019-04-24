<template>
  <div class="dashboard-task-list">
    <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
    <v-list dense three-line v-if="tasks && !loading">
      <empty-state v-if="tasks.length == 0" :illustration="emptyIllustration" small :label="$t('No task')"></empty-state>

      <template v-for="task in tasks">
        <v-list-tile :key="task._id" @click="openTask(task)" avatar>
          <v-list-tile-avatar :color="isOnline(task.assignedTo)">
            <span class="">{{ formatUserLetters(task.assignedTo) }}</span>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title><span class="grey--text text--darken-1 show-desktop"><template v-if="task.organization">[{{ task.organization.name }}]</template> {{ task.project.name}} - </span> {{ task.name }}</v-list-tile-title>
            <v-list-tile-sub-title>
              {{ $t('Last update') }} {{ formatDateDuration(task.updatedAt) }}
            </v-list-tile-sub-title>
            <v-list-tile-sub-title>
              <template v-if="task.dueDate && isLate(task)">
                {{ $t('Expired') }} <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
              <template v-if="task.dueDate && !isLate(task)">
                {{ $t('Expires') }} <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider inset :key="`divider-${task._id}`"></v-divider>
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
  i18n: {
    messages: {
      en: {
        "Last update": "Last update",
        "Expired": "Expired",
        "Expires": "Expires",
      },
      fr: {
        "Last update": "Dernière modification",
        "Expired": "Est arrivée à échéance",
        "Expires": "Arrive à échéance",
      }
    }
  },

  mounted() {
    this.$events.listen('close-task-detail', task => {
      this.$store.dispatch('selectTask', null);
      this.$store.dispatch('showTaskDetail', false);
    });

    Meteor.call(
      "dashboards.findTasks",
      this.user,
      this.type,
      1,
      (error, result) => {
        this.loading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.tasks = result.data;
      }
    );
  },
  beforeDestroy() {
    this.$events.off('close-task-detail');
    this.$store.dispatch('selectTask', null);
    this.$store.dispatch('showTaskDetail', false);
  },
  props: {
    user: {
      type: Object
    },
    type: {
      type: String,
      default: "recent"
    },
    emptyIllustration: {
      type: String,
      default: "empty"
    }
  },
  data() {
    return {
      loading: true,
      tasks: null
    };
  },
  methods: {
    openTask(task) {
      this.$store.dispatch('selectTask', task);
      this.$store.dispatch('showTaskDetail', true);
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