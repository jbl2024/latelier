<template>
  <div class="task-estimations-in-detail elevation-1">
    <v-layout row class="durations">
      <v-flex xs6>
        <v-text-field
          v-model="size"
          :label="$t('Size')"
          class="text"
          type="number"
          prepend-icon="mdi-timer"
          :readonly="loading"
        />
      </v-flex>
      <v-flex xs6>
        <v-text-field
          v-model="spent"
          :label="$t('Spent')"
          class="text"
          type="number"
          prepend-icon="mdi-timelapse"
          :readonly="loading"
        />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  name: "TaskEstimationsInDetail",
  i18n: {
    messages: {
      en: {
        Size: "Size",
        Spent: "Spent"
      },
      fr: {
        Size: "Durée",
        Spent: "Réalisé"
      }
    }
  },
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      size: null,
      spent: null,
      loading: false
    };
  },
  watch: {
    task: {
      immediate: true,
      handler(task) {
        if (task && task.estimation) {
          if (this.size !== task.estimation.size) {
            this.size = task.estimation.size;
          }
          if (this.spent !== task.estimation.spent) {
            this.spent = task.estimation.spent;
          }
        } else {
          this.size = null;
          this.spent = null;
        }
      }
    },
    async size(size) {
      if (!size) return;
      await this.debounceSize();
    },
    async spent(spent) {
      if (!spent) return;
      await this.debounceSpent();
    }
  },
  methods: {
    debounceSize: debounce(async function() {
      if (!this.task._id) return;
      if (this.task.estimation
          && this.task.estimation.size
          && this.task.estimation.size === this.size) {
        return;
      }

      this.loading = true;
      try {
        await Meteor.callAsync("tasks.updateSize", this.task._id, this.size);
      } catch (error) {
        // Handle the error here
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    }, 500),

    debounceSpent: debounce(async function() {
      if (!this.task._id) return;
      if (
        this.task.estimation
        && this.task.estimation.spent
        && this.task.estimation.spent === this.spent
      ) {
        return;
      }

      this.loading = true;
      try {
        await Meteor.callAsync(
          "tasks.updateSpent",
          this.task._id,
          this.spent
        );
      } catch (error) {
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    }, 500)
  }
};
</script>

<style scoped>
.text {
  margin: 24px;
}
</style>
