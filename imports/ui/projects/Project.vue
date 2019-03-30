<template>
  <div class="project"> 
    <confirm-dialog
      :active.sync="showDeleteTaskDialog"
      title="Confirmer la suppression ?"
      content="La tâche sera definitivement supprimée"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @cancel="onCancelDeleteTask"
      @confirm="onConfirmDeleteTask"
    />
    <project-filters-dialog
      :active.sync="showFiltersDialog"
      :projectId="projectId"
    />

    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div v-if="$subReady.project" class="project-wrapper"> 
      <div class="container-wrapper" :style="getBackgroundUrl(user)"> 
        <v-toolbar dense class="flex0 show-desktop">
          <v-btn icon @click="showFiltersDialog = true" v-if="$vuetify.breakpoint.smAndDown">
            <v-icon>filter_list</v-icon>
          </v-btn>

          <project-filters :projectId="projectId" v-if="$vuetify.breakpoint.mdAndUp"></project-filters>
          
          <v-spacer></v-spacer>
          <div>
          <v-tooltip top slot="activator" v-if="!isFavorite(user, projectId)">
            <v-btn icon @click.stop="addToFavorites(user, projectId)" slot="activator">
              <v-icon>star_border</v-icon>
            </v-btn>
            <span>{{ $t('Add to favorites') }}</span>
          </v-tooltip>
          </div>
          <div>
          <v-tooltip top slot="activator" v-if="isFavorite(user, projectId)">
            <v-btn icon @click.stop="removeFromFavorites(user, projectId)" slot="activator">
              <v-icon>star</v-icon>
            </v-btn>
            <span>{{ $t('Remove from favorites') }}</span>
          </v-tooltip>
          </div>
          <v-btn v-if="canManageProject(project)" icon :to="{ name: 'project-settings', params: { organizationId: organizationId, projectId: projectId }}">
            <v-icon>settings</v-icon>
          </v-btn>
        </v-toolbar>
        <kanban ref="container" class="kanban-container flex1" :projectId="projectId" :add-margin="showTaskDetail"></kanban>
      </div>
    </div>
</div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Backgrounds } from '/imports/api/backgrounds/backgrounds.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import { Permissions } from "/imports/api/permissions/permissions"

import debounce from 'lodash/debounce';
import { mapState } from "vuex";

export default {
  mounted () {
    this.$store.dispatch('setCurrentProjectId', this.projectId);    
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    this.$events.listen('close-task-detail', task => {
      this.$store.dispatch('selectTask', null);
      this.$store.dispatch('showTaskDetail', false);
      this.$router.push({ name: 'project', params: { organizationId: this.organizationId, projectId: this.projectId }}) 
    });
    this.$events.listen('delete-task', task => {
      this.taskToDelete = task;
      this.showDeleteTaskDialog = true;
    });
  },
  created () {
    this.debouncedFilter = debounce((val) => { this.$events.fire('filter-tasks', val)}, 400);
  },
  beforeDestroy() {
    this.$events.off('delete-task');
    this.$events.off('close-task-detail');
    this.$store.dispatch('setCurrentProjectId', 0);    
    this.$store.dispatch('selectTask', null);
    this.$store.dispatch('showTaskDetail', false);
  },
  props: {
    organizationId: {
      type: String,
      default: '0'
    },
    projectId: {
      type: String,
      default: '0'
    },
    taskId: {
      type: String,
      default: '0'
    }
  },
  computed: {
    ...mapState([
      "showTaskDetail",
    ])
  },  
  watch: {
    taskId: {
      immediate: true,
      handler (taskId) {
        if (taskId != 0) {
          this.selectTask(taskId);
        }
      }
    }
  },

  data () {
    return {
      savedProjectName: '',
      editProjectName: false,
      debouncedFilter: '',
      showDeleteTaskDialog: false,
      showFiltersDialog: false,
      taskToDeleted: undefined
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      },
      'user': function() {
        return [];
      }
    },
    project () {
      if (this.taskId != 0) {
        this.selectTask(this.taskId);
      }
      return Projects.findOne();
    },
    user () {
      return Meteor.user();
    }
  },
  methods: {
    selectTask (taskId) {
      var selectedTask = Tasks.findOne({_id: taskId});
      if (selectedTask) {
        this.$store.dispatch('selectTask', selectedTask);
        this.$store.dispatch('showTaskDetail', true);
      }
    },

    hasBackground() {
      return this.getBackgroundUrl();
    },

    getBackgroundUrl(user) {
      if (user && user.profile) {
        const background = user.profile.background;
        if (background) {
          return `background-image: url('${Backgrounds.link(background)}');`;
        }
      }
    },

    onCancelDeleteTask() {
      showDeleteTaskDialog = false;
    },

    onConfirmDeleteTask () {
      showDeleteTaskDialog = false;
      if (this.taskToDelete) {
        Meteor.call("tasks.remove", this.taskToDelete._id);
      }
    },

    isFavorite(user, projectId) {
      const favorites = user.profile.favoriteProjects || [];
      return favorites.indexOf(projectId) >= 0;
    },

    addToFavorites(user, projectId) {
      Meteor.call("projects.addToUserFavorites", {projectId: projectId, userId: user._id}, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t('Project added to favorites'));
      });
    },

    removeFromFavorites(user, projectId) {
      Meteor.call("projects.removeFromUserFavorites", {projectId: projectId, userId: user._id}, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t('Project removed from favorites'));
      });
    },

    canManageProject(project) {
      return Permissions.isAdmin(Meteor.userId(), project._id) || Permissions.isAdmin(Meteor.userId());
    }

     
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
}
::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0,0,0,.5);
    -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
}


.project {
  display: flex;
  min-height:0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
}

.project-wrapper {
  display: flex;
  min-height:0;
  flex-direction: column;
  flex:1;
  position: relative;
}

@media (max-width: 600px) {
  .kanban-container {
    margin: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 601px) {
  .kanban-container {
    margin: 4px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: scroll;
    padding-left: 4px;
    height: 100%;
  }
}


.container-wrapper {
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) { 
  .container-wrapper {
    min-height: 100vh;
  }
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}

</style>