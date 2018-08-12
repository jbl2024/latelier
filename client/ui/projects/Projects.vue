<template>
  <div class="projects">
    <new-project ref="newProject"></new-project>  

    <md-dialog-confirm
      :md-active.sync="showConfirmDialog"
      md-title="Confirmer la suppression ?"
      md-content="Le projet sera définitivement supprimé"
      md-confirm-text="Supprimer"
      md-cancel-text="Annuler"
      @md-cancel="onCancelDeleteProject"
      @md-confirm="onConfirmDeleteProject" />

    <md-dialog-confirm
      :md-active.sync="showConfirmCloneDialog"
      md-title="Confirmer le clonage du projet ?"
      md-content="Le projet sera cloné"
      md-confirm-text="Cloner"
      md-cancel-text="Annuler"
      @md-cancel="onCancelCloneProject"
      @md-confirm="onConfirmCloneProject" />

      <div class="show-desktop">
        <md-table v-model="projects" :md-sort.sync="currentSort" :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" md-card >
          <md-table-toolbar>
            <div class="md-toolbar-section-start">
              <h1 class="md-title">Projets</h1>
            </div>

            <md-field md-clearable class="md-toolbar-section-end">
              <md-icon>search</md-icon>
              <md-input placeholder="Rechercher..." v-on:input="debouncedFilter" autofocus/>
            </md-field>

          </md-table-toolbar>        

          <md-table-empty-state
            v-if="$subReady.projects"
            md-label="Aucun projet"
            :md-description="`Aucun projet trouvé pour '${filter}'. Essayer avec un autre terme ou créer un projet`">
            <md-button class="md-primary md-raised" @click="newProject">Créer un nouveau projet</md-button>
          </md-table-empty-state>

          <div v-if="!$subReady.projects">
            <md-progress-bar md-mode="indeterminate"></md-progress-bar>
          </div>


          <md-table-row slot="md-table-row" slot-scope="{ item }" class="row" @click="openProject(item._id)">
            <md-table-cell md-label="Nom" md-sort-by="name">
              <router-link :to="{ name: 'project', params: { projectId: item._id }}" class="project-name">
                {{ item.name }}
              </router-link>
            </md-table-cell>
            <md-table-cell md-label="Date de début" md-sort-by="startDate">
                {{ formatDate(item.startDate) }}
            </md-table-cell>
            <md-table-cell md-label="Date de fin" md-sort-by="endDate">
                {{ formatDate(item.endDate) }}
            </md-table-cell>
            <md-table-cell md-label="Actions">
              <md-button class="md-icon-button" @click.stop="openProjectSettings(item._id)">
                <md-icon>settings</md-icon>
                <md-tooltip md-delay="300">Paramétrer</md-tooltip>
              </md-button>
              <md-button class="md-icon-button" @click.stop="cloneProject(item._id)">
                <md-icon>file_copy</md-icon>
                <md-tooltip md-delay="300">Cloner</md-tooltip>
              </md-button>
              <md-button class="md-icon-button" @click.stop="deleteProject(item._id)">
                <md-icon>delete</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
            </md-table-cell>
          </md-table-row>

        </md-table>
      </div>

      <div class="show-mobile">
        <md-table v-model="projects" md-sort="name" md-sort-order="asc" md-card >
          <md-table-toolbar>
            <div class="md-toolbar-section-start">
              <h1 class="md-title">Projets</h1>
            </div>

            <md-field md-clearable class="md-toolbar-section-end">
              <md-icon>search</md-icon>
              <md-input placeholder="Rechercher..." v-on:input="debouncedFilter" autofocus/>
            </md-field>

          </md-table-toolbar>        

          <md-table-empty-state
            v-if="$subReady.projects"
            md-label="Aucun projet"
            :md-description="`Aucun projet trouvé pour '${filter}'. Essayer avec un autre terme ou créer un projet`">
            <md-button class="md-primary md-raised" @click="newProject">Créer un nouveau projet</md-button>
          </md-table-empty-state>



            <md-table-row slot="md-table-row" slot-scope="{ item }" class="row" @click="openProject(item._id)">
              <md-table-cell md-label="Nom" md-sort-by="name">
                <router-link :to="{ name: 'project', params: { projectId: item._id }}" class="project-name">
                  {{ item.name }}
                </router-link>
              </md-table-cell>
              <md-table-cell md-label="Actions">
                <md-button class="md-icon-button" @click.stop="openProjectSettings(item._id)">
                  <md-icon>settings</md-icon>
                  <md-tooltip md-delay="300">Paramétrer</md-tooltip>
                </md-button>
                <md-button class="md-icon-button" @click.stop="cloneProject(item._id)">
                  <md-icon>file_copy</md-icon>
                  <md-tooltip md-delay="300">Cloner</md-tooltip>
                </md-button>
                <md-button class="md-icon-button" @click.stop="deleteProject(item._id)">
                  <md-icon>delete</md-icon>
                  <md-tooltip md-delay="300">Supprimer</md-tooltip>
                </md-button>
              </md-table-cell>
            </md-table-row>
        </md-table>
      </div>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
import DatesMixin from '/imports/ui/mixins/DatesMixin.js'
import debounce from 'lodash/debounce';

export default {
  mixins: [DatesMixin],
  data () {
    return {
      filter: '',
      selected: [],
      debouncedFilter: '',
      filteredProjects: [],
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      currentSort: 'name',
      currentSortOrder: 'asc',
      projectId: ''
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
      this.projectId = projectId;
      this.showConfirmDialog = true;
    },

    onConfirmDeleteProject () {
      this.showConfirmDialog = false;
      Meteor.call('projects.remove', this.projectId);
    },

    onCancelDeleteProject () {
      this.showConfirmDialog = false;
    },

    cloneProject (projectId) {
      this.projectId = projectId;
      this.showConfirmCloneDialog = true;
    },

    onConfirmCloneProject () {
      this.showConfirmCloneDialog = false;
      Meteor.call('projects.clone', this.projectId);
    },

    onCancelCloneProject () {
      this.showConfirmCloneDialog = false;
    },

    openProject (id) {
      this.$router.push({ name: 'project', params: { projectId: id }}) 
    },

    openProjectSettings (id) {
      this.$router.push({ name: 'project-settings', params: { projectId: id }}) 
    },

    customSort (value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;

        if (this.currentSortOrder === 'desc') {
          if (a[sortBy] instanceof Date) {
            return a[sortBy] > b[sortBy];
          }
          return a[sortBy].localeCompare(b[sortBy]);
        }
        if (b[sortBy] instanceof Date) {
          return b[sortBy] > a[sortBy];
        }

        return b[sortBy].localeCompare(a[sortBy]);
      })
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
      this.$events.fire('projects-loaded');
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
  z-index: 1002;
}

.project-name {
  color: black !important;
  font-weight: normal;
}

.row {
  cursor: pointer;
}



</style>