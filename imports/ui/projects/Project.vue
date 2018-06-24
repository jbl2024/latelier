<template>
  <div class="project">
    <div v-if="!$subReady.project">
      Loading...
    </div>
    <div v-if="$subReady.project">
      <h2>
        <router-link :to="{ name: 'home'}">Accueil</router-link> > {{ project.name }}
      </h2>
    </div>
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