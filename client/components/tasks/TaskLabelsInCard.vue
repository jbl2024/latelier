<template>
  <div class="task-labels">
    <div
      v-for="label in labels"
      :key="label._id"
      :title="label.name"
      :class="{ label: true, show: showLabelText }"
      :style="getColor(label)"
      @click.stop="toggleLabel"
    >
      <template v-if="showLabelText">
        {{ label.name }}
      </template>
    </div>
  </div>
</template>

<script>
import { Labels } from "/imports/api/labels/labels.js";
import { colors } from "/imports/colors.js";

import { mapState } from "vuex";

export default {
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState(["showLabelText"])
  },
  meteor: {
    labels: {
      params() {
        return {
          id: this.task
        };
      },
      deep: true,
      update() {
        const labelIds = this.task.labels || [];
        return Labels.find({ _id: { $in: labelIds } }, { sort: { name: 1 } });
      }
    }
  },
  methods: {
    getColor(label) {
      return `
        background-color: ${label.color};
        color: ${colors.getLabelColor(label.color)}
      `;
    },

    toggleLabel() {
      this.$store.dispatch("setShowLabelText", !this.showLabelText);
    }
  }
};
</script>

<style scoped>
.task-labels {
  display: flex;
  flex-direction: row;
}

.label {
  width: 48px;
  height: 8px;
  margin-right: 4px;
}

.show {
  width: auto;
  min-width: 48px;
  max-width: 100px;
  height: 16px;
  margin-right: 4px;
  font-size: 9px;
  padding: 2px;
  overflow-x: hidden;
  text-align: center;
}
</style>
