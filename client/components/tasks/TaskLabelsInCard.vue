<template>

<div class="task-labels">
  <div class="label" v-for="label in labels" :key="label._id" :style="getColor(label)">
    {{ label.name }}
  </div>
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
    getColor (label) {
      return 'background-color: ' + label.color;
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
  /* width: 52px; */
  /* height: 8px; */
  height: 16px;
  margin-right: 4px;
  font-size: 8px;
  padding: 2px;
  text-transform: uppercase;
  overflow-x: hidden;
  text-align: center;
}
</style>