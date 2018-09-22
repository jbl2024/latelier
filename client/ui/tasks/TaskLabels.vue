<template>

<div class="task-labels">
  <select-label ref="selectLabel" @select="onSelectLabel"></select-label>  
  <md-chip v-for="label in labels" md-deletable :key="label._id" :style="getColor(label)" @md-delete="removeLabel(label)">{{ label.name }}</md-chip>
  <md-button class="md-icon-button md-dense md-raised" @click="$refs.selectLabel.open()">
    <md-icon>add</md-icon>
    <md-tooltip md-delay="300">Ajouter un label</md-tooltip>
  </md-button>
</div>

</template>

<script>
import { Labels } from '/imports/api/labels/labels.js'
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    task: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
    };
  },
  meteor: {
    labels: {
      params () {
        return {
          id: this.task
        };
      },
      deep: true,
      update ({task}) {
        var labelIds = this.task.labels || [];
        return Labels.find({_id: {$in: labelIds}}, {sort: {name: 1}});
      }
    }
  },
  methods: {
    onSelectLabel (label) {
      Meteor.call('tasks.addLabel', this.task._id, label._id);
    },

    getColor (label) {
      return 'background-color: ' + label.color;
    },

    removeLabel (label) {
      Meteor.call('tasks.removeLabel', this.task._id, label._id);
    }
  }
};
</script>

<style scoped>
</style>