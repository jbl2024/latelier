<template>
  <div class="task-list">
    <v-list two-line v-if="tasks">
      <empty-state
        v-if="tasks.length == 0"
        :illustration="emptyIllustration"
        small
        :label="$t('No task')"
      ></empty-state>

      <template v-for="task in tasks">
        <v-list-item :key="task._id" @click.stop="openTask(task)">
          <v-list-item-avatar :color="isOnline(task.assignedTo)">
            <author-avatar :user-id="task.assignedTo"></author-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <span class="black--text">{{ task.name }}</span>
            </v-list-item-title>
            <v-list-item-subtitle>
              <span class="grey--text text--darken-1 show-desktop">
                <template v-if="task.organization">{{ task.organization.name }} / </template>
                {{ task.project.name}}
              </span>
            </v-list-item-subtitle>
            <v-list-item-subtitle>{{ $t('Last update') }} {{ formatDateDuration(task.updatedAt) }}</v-list-item-subtitle>
            <v-list-item-subtitle>
              <template v-if="task.dueDate && isLate(task)">
                {{ $t('Expired') }}
                <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
              <template v-if="task.dueDate && !isLate(task)">
                {{ $t('Expires') }}
                <b>{{ formatDateDuration(task.dueDate) }}</b>
              </template>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider inset :key="`divider-${task._id}`"></v-divider>
      </template>
    </v-list>
  </div>
</template>

<script>
import UsersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "task-list",
  mixins: [UsersMixin, DatesMixin],
  i18n: {
    messages: {
      en: {
        "Last update": "Last update",
        Expired: "Expired",
        Expires: "Expires"
      },
      fr: {
        "Last update": "Dernière modification",
        Expired: "Est arrivée à échéance",
        Expires: "Arrive à échéance"
      }
    }
  },  
  mounted() {
    this.$events.listen("close-task-detail", task => {
      this.$store.dispatch("selectTask", null);
      this.$store.dispatch("showTaskDetail", false);
    });
  },
  beforeDestroy() {
    this.$events.off("close-task-detail");
    this.$store.dispatch("selectTask", null);
    this.$store.dispatch("showTaskDetail", false);
  },
  props: {
    tasks: {
      type: Array
    },
    emptyIllustration: {
      type: String,
      default: "empty"
    }
  },
  data() {
    return {
    };
  },
  methods: {
    openTask(task) {
      this.$store.dispatch("selectTask", task);
      this.$store.dispatch("showTaskDetail", true);
    },
    isLate(task) {
      return task.dueDate && task.dueDate <= new Date();
    },
  }
};
</script>

<style scoped>
.empty-state {
  margin-top: 24px;
}
</style>