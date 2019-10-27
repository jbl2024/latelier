<template>
  <div class="task-labels-in-new-task">
    <select-label
      ref="selectLabel"
      :project-id="projectId"
      @select="onSelectLabel"
    />
    <v-chip
      v-for="label in labels"
      :key="label._id"
      close
      :style="getColor(label)"
      @update:active="removeLabel(label)"
    >
      {{ label.name }}
    </v-chip>
    <v-btn
      v-show="labels.length == 0"
      rounded
      @click="$refs.selectLabel.open()"
    >
      {{ $t("Add label") }}
    </v-btn>
    <v-btn
      v-show="labels.length > 0"
      fab
      small
      @click="$refs.selectLabel.open()"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { colors } from "/imports/colors.js";

export default {
  props: {
    projectId: {
      type: String,
      default: ""
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      labels: this.value
    };
  },
  watch: {
    value(value) {
      this.labels = value;
    }
  },
  methods: {
    getColor(label) {
      return `
        background-color: ${label.color};
        color: ${colors.getLabelColor(label.color)}
      `;
    },

    onSelectLabel(label) {
      if (this.labels.find((aLabel) => aLabel._id === label._id)) {
        return;
      }
      this.labels.push(label);
      this.$emit("input", this.labels);
    },

    removeLabel(label) {
      this.labels = this.labels.filter((aLabel) => aLabel._id !== label._id);
      this.$emit("input", this.labels);
    }
  }
};
</script>

<style scoped>
.cursor {
  cursor: pointer;
}
</style>
