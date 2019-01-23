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

    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div v-if="$subReady.project" class="project-wrapper"> 
      <v-navigation-drawer right absolute v-model="showTaskDetail" :width="600" stateless>
        <v-card>
          <task-detail :taskId="selectedTask._id" v-if="selectedTask && selectedTask._id"></task-detail>
        </v-card>
      </v-navigation-drawer>

      <div class="container-wrapper" :style="getBackgroundUrl(user)"> 
        <kanban ref="container" class="kanban-container" @click="showTaskDetail=false" :projectId="projectId" :add-margin="showTaskDetail"></kanban>
      </div>

    </div>
</div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Backgrounds } from '/imports/api/backgrounds/backgrounds.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import debounce from 'lodash/debounce';

export default {
  mounted () {
    // this.selectedTask = null;
    this.$store.dispatch('setCurrentProjectId', this.projectId);    
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    this.$events.listen('close-task-detail', task => {
      this.$events.fire('task-selected', null);
      this.showTaskDetail = false;
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
      showTaskDetail: false,
      selectedTask: {},
      debouncedFilter: '',
      showDeleteTaskDialog: false,
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
        this.selectedTask = selectedTask;
        this.showTaskDetail = true;            
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
  }
}


.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  position: relative;
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
}

@media (max-width: 600px) { 
  .container-wrapper {
    min-height: 100vh;
  }
}


</style>