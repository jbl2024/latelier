<template>

<div class="task-labels-in-new-task">
  <select-label ref="selectLabel" :projectId="projectId" @select="onSelectLabel"></select-label>  
  <v-chip v-for="label in labels" close :key="label._id" :style="getColor(label)" @input="removeLabel(label)">{{ label.name }}</v-chip>
  <v-btn round v-show="labels.length == 0" @click="$refs.selectLabel.open()">Ajouter un label</v-btn>
  <v-btn v-show="labels.length > 0" fab small @click="$refs.selectLabel.open()">
    <v-icon>add</v-icon>
  </v-btn>
</div>

</template>

<script>
import { Labels } from '/imports/api/labels/labels.js'
import { colors } from '/imports/colors.js'

export default {
  props: {
    projectId: String,
    value: Array
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
    getColor (label) {
      return `
        background-color: ${label.color};
        color: ${colors.getLabelColor(label.color)}
      `
    },

    onSelectLabel (label) {
      if (this.labels.find(aLabel => { return aLabel._id === label._id})) {
        return;
      }
      this.labels.push(label);
      this.$emit('input', this.labels);
    },

    removeLabel (label) {
      this.labels = this.labels.filter(aLabel => {
        return aLabel._id !== label._id;
      });
      this.$emit('input', this.labels);
    }
  }
};
</script>

<style scoped>
.cursor {
  cursor: pointer;
}
</style>