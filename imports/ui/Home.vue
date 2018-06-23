<template>
  <div class="home">
    <md-table v-model="projects" md-sort="name" md-sort-order="asc" md-card md-fixed-header>
      <md-table-toolbar>
        <h1 class="md-title">Projets</h1>
      </md-table-toolbar>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Nom" md-sort-by="name">{{ item.name }}</md-table-cell>
      </md-table-row>
    </md-table>

  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  data () {
    return {
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      'projects': [],
    },
    projects () {
      return Projects.find({}, {
        sort: {date: -1}
      })
    },
    count () {
      return Projects.find().count();
    }      
  },
}
</script>

<style scoped>
</style>