<template>
  <div class="task-estimations-in-detail elevation-1">
    <v-layout row class="durations">
      <v-flex xs6>
        <v-text-field
          :label="$t('Size')"
          class="text"
          type="number"
          prepend-icon="timer"
          :readonly="loading"
          v-model="size"
        ></v-text-field>
      </v-flex>
      <v-flex xs6>
        <v-text-field
          :label="$t('Spent')"
          class="text"
          type="number"
          prepend-icon="timelapse"
          :readonly="loading"
          v-model="spent"
        ></v-text-field>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import debounce from "lodash/debounce";

export default {
  name: "task-estimations-in-detail",
  i18n: {
    messages: {
      en: {
        "Size": "Size",
        "Spent": "Spent"
      },
      fr: {
        "Size": "Durée",
        "Spent": "Réalisé"
      }
    }
  },
  props: {
    task: {
      type: Object
    }
  },
  watch: {
    task: {
      immediate: true,
      handler(task) {
        if (task && task.estimation) {
          if (this.size !== task.estimation.size) this.size = task.estimation.size;
          if (this.spent !== task.estimation.spent) this.spent = task.estimation.spent;
        } else {
          this.size = null
          this.spent = null;
        }
      }
    },
    size(size) {
      if (!size) return;
      this.debounceSize();
    },
    spent(spent) {
      if (!spent) return;
      this.debounceSpent();
    }
  },
  data() {
    return {
      size: null,
      spent: null,
      loading: false
    };
  },
  methods: {
    debounceSize: debounce(function () {
      if (!this.task._id) return;
      if (this.task.estimation && this.task.estimation.size && this.task.estimation.size === parseInt(this.size, 10)) return;
      
      this.loading = true;
      Meteor.call("tasks.updateSize", this.task._id, parseInt(this.size, 10), (error, result) => {
        this.loading = false;
      });
    }, 500),

    debounceSpent: debounce(function () {
      if (!this.task._id) return;
      if (this.task.estimation && this.task.estimation.spent && this.task.estimation.spent === parseInt(this.spent, 10)) return;

      this.loading = true;
      Meteor.call("tasks.updateSpent", this.task._id, parseInt(this.spent, 10), (error, result) => {
        this.loading = false;
      });
    }, 500)
  }
};
</script>

<style scoped>
.text {
  margin: 24px;
}
</style>