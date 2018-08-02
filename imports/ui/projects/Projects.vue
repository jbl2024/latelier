<template>
  <div class="projects">


    <new-project ref="newProject"></new-project>  

    <div>
      <md-table v-model="projects" md-sort="name" md-sort-order="asc" md-card>
        <md-table-toolbar>
          <div class="md-toolbar-section-start">
            <h1 class="md-title">Projets</h1>
          </div>

          <md-field md-clearable class="md-toolbar-section-end">
            <md-icon>search</md-icon>
            <md-input placeholder="Rechercher..." v-on:input="debouncedFilter"/>
          </md-field>

        </md-table-toolbar>        

        <md-table-empty-state
          md-label="Aucun projet"
          :md-description="`Aucun projet trouvé pour '${filter}'. Essayer avec un autre terme ou créer un projet`">
          <md-button class="md-primary md-raised" @click="newProject">Créer un nouveau projet</md-button>
        </md-table-empty-state>

        <div v-if="!$subReady.projects">
          <md-progress-bar md-mode="indeterminate"></md-progress-bar>
        </div>


        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Nom" md-sort-by="name">
            <router-link :to="{ name: 'project', params: { projectId: item._id }}">
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

    <md-speed-dial class="absolute-right">
      <md-speed-dial-target @click="newProject">
        <md-icon>add</md-icon>
      </md-speed-dial-target>
    </md-speed-dial>

  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
import debounce from 'lodash/debounce';

export default {
  data () {
    return {
      filter: '',
      selected: [],
      debouncedFilter: '',
      filteredProjects: []
    }
  },
  created () {
    this.debouncedFilter = debounce((val) => { this.filter = val}, 400);
  },
  methods: {
    newProject () {
      this.$refs.newProject.open();
    },
    deleteProject (projectId) {
      Meteor.call('projects.remove', projectId);
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      'projects': function() {
        // Here you can use Vue reactive properties
        return [this.filter] // Subscription params
      }
    },
    projects () {
      return Projects.find({}, {
          sort: {name: 1}
      });
    },
    count () {
      return Projects.find().count();
    }      
  },
}
</script>

<style scoped>
.absolute-right {
  position: fixed;
  right: 24px;
  bottom: 24px;
}


</style>