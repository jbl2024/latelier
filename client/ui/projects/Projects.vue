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
      <md-empty-state
        v-if="projects.length == 0"
        :md-description="`Aucun projet disponible`">
        <md-button class="md-primary md-raised" @click="newProject">Créer un nouveau projet</md-button>
      </md-empty-state>
      <md-list class="md-double-line" v-show="projects.length != 0"> 
        <md-subheader>{{ organization.name}}</md-subheader>

        <template v-for="item in projects" >
          <md-list-item :key='item._id'>
            <md-avatar class="md-avatar-icon" :style="getColor(item)">
              <md-icon :class="getVisibilityIconClass(item)">{{ getVisibilityIcon(item) }}</md-icon>
            </md-avatar>

            <div class="md-list-item-text pointer" @click="openProject(item._id)">
              <span>{{ item.name }}</span>
              <span>{{ formatProjectDates(item) }}</span>
            </div>

            <md-button class="md-icon-button show-desktop" @click.stop="openProjectSettings(item._id)">
              <md-icon>settings</md-icon>
              <md-tooltip md-delay="300">Paramétrer</md-tooltip>
            </md-button>
            <md-button class="md-icon-button show-desktop" @click.stop="cloneProject(item._id)">
              <md-icon>file_copy</md-icon>
              <md-tooltip md-delay="300">Cloner</md-tooltip>
            </md-button>

            <md-button class="md-icon-button show-desktop" @click.stop="deleteProject(item._id)">
              <md-icon>delete</md-icon>
              <md-tooltip md-delay="300">Supprimer</md-tooltip>
            </md-button>


          </md-list-item>
          <md-divider class="md-inset"></md-divider>
        </template>
      </md-list>
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
</style>