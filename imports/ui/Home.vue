<template>
  <div class="home">

    <md-speed-dial class="md-bottom-right">
      <md-speed-dial-target @click="newProject">
        <md-icon>add</md-icon>
      </md-speed-dial-target>
    </md-speed-dial>
     
    <md-table v-model="projects" md-sort="name" md-sort-order="asc">
      <md-table-toolbar>
        <h1 class="md-title">Projets</h1>
      </md-table-toolbar>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Nom" md-sort-by="name">
          <router-link :to="{ name: 'projects', params: { projectId: item._id }}">
            {{ item.name }}
          </router-link>
        </md-table-cell>
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
  methods: {
    newProject () {
      window.alert('You can have a custom click inside the target!')
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