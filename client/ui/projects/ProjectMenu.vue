<template>

<div class="project-menu">
  {{ project.name }}
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    project: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
    };
  },
  methods: {
  }
};
</script>

<style scoped>

</style>