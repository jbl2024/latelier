<template>
  <div class="home">


    <blaze-template template="loginButtons"></blaze-template>
    <new-project ref="newProject"></new-project>  

    <div v-if="!$subReady.projects">
      Loading...
    </div>
    <div v-if="$subReady.projects">
      <md-table v-model="projects" md-sort="name" md-sort-order="asc" md-card>
        <md-table-toolbar>
          <h1 class="md-title">Projets</h1>
        </md-table-toolbar>

        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Nom" md-sort-by="name">
            <router-link :to="{ name: 'projects', params: { projectId: item._id }}">
              {{ item.name }}
            </router-link>
          </md-table-cell>
          <md-table-cell md-label="Actions">
            <md-button class="md-icon-button" @click="deleteProject(item._id)">
              <md-icon>delete</md-icon>
            </md-button>
          </md-table-cell>
        </md-table-row>

      </md-table>
    </div>

    <md-speed-dial class="md-bottom-right">
      <md-speed-dial-target @click="newProject">
        <md-icon>add</md-icon>
      </md-speed-dial-target>
    </md-speed-dial>

  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  data () {
    return {
      selected: [],
    }
  },
  methods: {
    newProject () {
      this.$refs.newProject.open();
    },
    deleteProject (projectId) {
      Meteor.call('projects.remove', projectId);
    },
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