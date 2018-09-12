<template>

<div class="project-menu">
  {{ project.name }}
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  meteor: {
    project: {
      params () {
        return {
          id: this.projectId
        };
      },
      deep: false,
      update ({id}) {
        return Projects.findOne({ _id: id}) || {};
      }
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