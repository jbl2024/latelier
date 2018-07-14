<template>
  <div class="project">
    <div v-if="!$subReady.project">
      Loading...
    </div>
    <div v-if="$subReady.project">
      <h1 class="md-title">
        <router-link :to="{ name: 'home'}">Accueil</router-link> > {{ project.name }}
      </h1>

      <list v-for="list in lists" :key='list._id' :list="list"></list>
            

      <md-table v-model="lists" md-sort="name" md-sort-order="asc" md-card>
        <md-table-toolbar>
          <h1 class="md-title">Listes</h1>
        </md-table-toolbar>

        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Nom" md-sort-by="name">
              {{ item.name }}
          </md-table-cell>
        </md-table-row>

      </md-table>




    </div>
  </div>    
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'

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
    },
    lists () {
      return Lists.find();
    }
  }
}
</script>

<style scoped>
</style>