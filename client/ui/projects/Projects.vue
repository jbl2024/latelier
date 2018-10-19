<template>
  <div class="projects">
    <new-project ref="newProject" :organizationId="organizationId"></new-project>  

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

    <div v-if="!$subReady.projects">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
      
    <div v-if="$subReady.projects">
      <empty-state
        v-if="projects.length == 0"
        :description="`Aucun projet disponible`">
        <md-button class="md-primary md-raised" @click="newProject">Créer un nouveau projet</md-button>
      </empty-state>

      <V-list two-line subheader v-show="projects.length != 0"> 
        <v-subheader inset>
          <router-link :to="{ name: 'organizations-page' }">{{ organization.name }}</router-link>&nbsp;> Projets
        </v-subheader>

        <div class="md-elevation-1">
        <template v-for="item in projects" >

          <v-list-tile :key='item._id' @click="openProject(item._id)">
            <v-list-tile-avatar :style="getColor(item)">
              <v-icon :class="getVisibilityIconClass(item)">{{ getVisibilityIcon(item) }}</v-icon>
            </v-list-tile-avatar>            

            <v-list-tile-content class="pointer">
              <v-list-tile-title>{{ item.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ formatProjectDates(item) }}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn icon ripple @click.stop="openProjectSettings(item._id)">
                <v-icon>settings</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn icon ripple @click.stop="cloneProject(item._id)">
                <v-icon>file_copy</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn icon ripple @click.stop="deleteProject(item._id)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider></v-divider>

        </template>
        </div>
      </V-list>

      <div class="absolute-right">
        <md-button class="md-fab" @click="newProject">
            <md-icon>add</md-icon>          
            <md-tooltip md-delay="300">Ajouter un projet</md-tooltip>
        </md-button>
      </div>

    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import debounce from "lodash/debounce";
import { mapState } from "vuex";

export default {
  mixins: [DatesMixin],
  created() {
    this.debouncedFilter = debounce(val => {
      this.filter = val;
    }, 400);
  },
  mounted() {
    this.$store.dispatch("setShowCategories", true);
  },
  beforeDestroy() {
    this.$store.dispatch("setShowCategories", false);
  },
  computed: {
    ...mapState(["selectedGroup"])
  },
  props: {
    organizationId: {
      type: String,
      defaultValue: '0'
    }
  },
  data() {
    return {
      filter: "",
      selected: [],
      debouncedFilter: "",
      filteredProjects: [],
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      currentSort: "name",
      currentSortOrder: "asc",
      projectId: ""
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      projects: function() {
        // Here you can use Vue reactive properties
        return [this.organizationId, this.filter, this.$store.state.selectedGroup._id]; // Subscription params
      },
      organization: function() {
        // Here you can use Vue reactive properties
        return [this.organizationId]; // Subscription params
      },
      projectGroups: function() {
        return [this.organizationId];
      }
    },
    projects() {
      this.$events.fire("projects-loaded");
      return Projects.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    },
    organization() {
      return Organizations.findOne()
    }
  },
  methods: {
    newProject() {
      this.$refs.newProject.open();
    },
    deleteProject(projectId) {
      this.projectId = projectId;
      this.showConfirmDialog = true;
    },

    onConfirmDeleteProject() {
      this.showConfirmDialog = false;
      Meteor.call("projects.remove", this.projectId);
    },

    onCancelDeleteProject() {
      this.showConfirmDialog = false;
    },

    cloneProject(projectId) {
      this.projectId = projectId;
      this.showConfirmCloneDialog = true;
    },

    onConfirmCloneProject() {
      this.showConfirmCloneDialog = false;
      Meteor.call("projects.clone", this.projectId);
    },

    onCancelCloneProject() {
      this.showConfirmCloneDialog = false;
    },

    openProject(id) {
      this.$router.push({ name: "project", params: { projectId: id } });
    },

    openProjectSettings(id) {
      this.$router.push({
        name: "project-settings",
        params: { projectId: id }
      });
    },

    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;

        if (this.currentSortOrder === "desc") {
          if (a[sortBy] instanceof Date) {
            return a[sortBy] > b[sortBy];
          }
          return a[sortBy].localeCompare(b[sortBy]);
        }
        if (b[sortBy] instanceof Date) {
          return b[sortBy] > a[sortBy];
        }

        return b[sortBy].localeCompare(a[sortBy]);
      });
    },
    getDescription() {
      if (this.filter.length == 0) {
        return "";
      } else {
        return `Aucun projet trouvé pour '${
          this.filter
        }'. Essayer avec un autre terme ou créer un projet`;
      }
    },
    deselectGroup(str, index) {
      this.$store.dispatch("setSelectedGroup", null);
    },

    getVisibilityIcon(project) {
      if (project.isPublic) {
        return "visibility";
      }
      return "visibility_off";
    },

    getVisibilityIconClass(project) {
      if (project.isPublic) {
        return "";
      }
      return "";
    },

    getColor (item) {
      return 'background-color: ' + item.color;
    },


    formatProjectDates (project) {
      if (project.startDate && project.endDate) {
        return 'Du  ' + this.formatDate(project.startDate) + ' au ' + this.formatDate(project.endDate);
      } else if (project.startDate) {
        return 'A partir du ' + this.formatDate(project.startDate);
      } else if (project.endtDate) {
        return 'Jusqu\'au ' + this.formatDate(project.endDate);
      }
      return '';
    }
  }
};
</script>

<style scoped>
.project-name {
  color: black !important;
  font-weight: normal;
}

.row {
  cursor: pointer;
}

.title {
  font-size: 20px;
  font-weight: normal;
  margin-right: 12px;
}

.pointer { 
  cursor: pointer;
}


@media (min-width: 601px) {
  .fap-list {
    margin-right: 92px;
    margin-left: 48px;
  }
}

@media (max-width: 600px) {
  .fap-list {
    margin-right: auto; 
    margin-left: auto;
  }
}
</style>