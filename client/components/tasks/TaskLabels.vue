<template>
  <div class="task-labels">
    <select-label
      ref="selectLabel"
      :project-id="task.projectId"
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
    <v-chip
      v-show="labels.length == 0"
      v-shortkey="['l']"
      tabindex="0"
      @keyup.enter.native="selectLabel()"
      @click="selectLabel()"
      @shortkey="selectLabel()"
    >
      {{ $t("Add label") }}
    </v-chip>
    <v-btn
      v-show="labels.length > 0"
      class="add-label"
      fab
      x-small
      @click="$refs.selectLabel.open()"
    >
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
import { Labels } from "/imports/api/labels/labels.js";
import { colors } from "/imports/colors.js";

export default {
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
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
    onSelectLabel(label) {
      Meteor.call("tasks.addLabel", this.task._id, label._id);
    },

    getColor(label) {
      return `
        background-color: ${label.color};
        color: ${colors.getLabelColor(label.color)}
      `;
    },

    removeLabel(label) {
      Meteor.call("tasks.removeLabel", this.task._id, label._id);
    },

    selectLabel() {
      if (this.task?._id) {
        this.$refs.selectLabel.open();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .task-labels {
    margin-bottom: 1rem;
    .v-chip + .v-chip,
    .v-chip + .add-label {
      margin-left: 4px;
    }
    line-height: 2.5;
  }
</style>
