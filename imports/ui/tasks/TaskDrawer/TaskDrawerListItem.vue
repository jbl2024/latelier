<template>
  <v-list-item
    v-if="task"
    @click="openTask(task)"
    class="task-drawer-list-item"
    :class="selected ? 'v-list-item--active' : null"
    :style="selected ? selectedStyles : null"
  >
    <v-list-item-content>
      <v-list-item-title class="no-wrap">
        <div class="task-name">
          <v-icon v-if="task.completed" small>
            mdi-check-box-outline
          </v-icon>
          {{ task.name }}
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        <span class="grey--text text--darken-1 show-desktop">
          <template v-if="task.organization">
            {{ task.organization.name }} /
          </template>
          {{ task.project.name }}
        </span>
      </v-list-item-subtitle>
      <v-list-item-subtitle>
        {{ $t("Last update") }}
        {{ formatDateDuration(task.updatedAt) }}
      </v-list-item-subtitle>
      <v-list-item-subtitle>
        <template v-if="task.dueDate && isLate(task)">
          {{ $t("Expired") }}
          <b>{{ formatDateDuration(task.dueDate) }}</b>
        </template>
        <template v-if="task.dueDate && !isLate(task)">
          {{ $t("Expires") }}
          <b>{{ formatDateDuration(task.dueDate) }}</b>
        </template>
      </v-list-item-subtitle>
      <v-list-item-subtitle v-if="task.completed">
        <template>
          {{ $t("Completed on") }}
          <b>{{ formatDateDuration(task.completedAt) }}</b>
        </template>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import UsersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { colors } from "/imports/colors.js";

export default {
  name: "TaskDrawerListItem",
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
  props: {
    task: {
      type: Object,
      default: null
    },
    selected: {
      type: Boolean,
      default: false
    },
    selectedColor: {
      type: String,
      default: null
    }
  },
  computed: {
    selectedStyles() {
      return {
        color: this.selectedColor,
        borderLeft: `solid 5px ${colors.adjust(this.selectedColor, -40)}`
      };
    }
  },
  methods: {
    openTask(task) {
      if (this.$listeners && this.$listeners.select) {
        this.$emit("select", task);
        return;
      }
      this.$store.dispatch("selectTask", task);
      this.$store.dispatch("showTaskDetail", true);
    },
    isLate(task) {
      return task.dueDate && task.dueDate <= new Date();
    },
  }
};
</script>

<style lang="scss">
.task-drawer-list-item {
  .no-wrap {
    white-space: normal;
  }
  .task-name {
    margin-bottom: 4px;
  }
}
</style>
