<template>
  <div class="project">
    <h1>{{ project.name }}</h1>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      }
    },
    project () {
      return Projects.findOne();
    }
  }
}
</script>

<style scoped>
</style>