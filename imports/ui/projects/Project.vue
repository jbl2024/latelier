<template>
  <div class="project"> 

    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>

    <div v-if="$subReady.project" class="project-wrapper"> 

      <v-dialog v-model="showTaskDetail" class="detail" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <task-detail :taskId="selectedTask._id"></task-detail>
        </v-card>
      </v-dialog>

      <div class="container-wrapper">
        <kanban ref="container" class="container" @click="showTaskDetail=false" :projectId="projectId"></kanban>
      </div>


    </div>
</div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import debounce from 'lodash/debounce';

export default {
  mounted () {
    this.$store.dispatch('setCurrentProjectId', this.projectId);    
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    this.$events.listen('close-task-detail', task => {
      this.$events.fire('task-selected', null);
      this.showTaskDetail = false;
      this.$router.push({ name: 'project', params: { organizationId: this.organizationId, projectId: this.projectId }}) 
    });
  },
  created () {
    this.debouncedFilter = debounce((val) => { this.$events.fire('filter-tasks', val)}, 400);
  },
  beforeDestroy() {
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
    },
  },

  data () {
    return {
      savedProjectName: '',
      editProjectName: false,
      showTaskDetail: false,
      selectedTask: {},
      debouncedFilter: ''
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      },
    },
    project () {
      if (this.taskId != 0) {
        this.selectTask(this.taskId);
      }
      return Projects.findOne();
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
    startUpdateProjectName () {
      this.savedProjectName = this.project.name;
      this.editProjectName = true;
      this.$nextTick(() => this.$refs.name.focus())
    },

    updateProjectName () {
      this.editProjectName = false;
      Meteor.call('projects.updateName', this.project._id, this.project.name);
    },

    cancelUpdateProjectName () {
      this.editProjectName = false;
      this.project.name = this.savedProjectName;
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


.toolbar {
  background-color: white;
}

.search {
  max-width: 300px;
}

.md-content { 
  padding: 8px;
}

.project {
  display: flex;
  min-height:0;
  height: 100%;
  flex-direction: column;
}

.project-wrapper {
  display: flex;
  min-height:0;
  flex-direction: column;
  flex:1;
  background-color: #eee !important;
}

.edit-project-name input {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: .02em;
  margin-top: 6px;
  padding: 0;
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
}

.edit-project-name .md-button {
  margin: 0;
}

@media (max-width: 600px) {
  .container {
    margin: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 601px) {
  .container {
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
  display: flex;
  flex-direction: column;
}

.md-menu-item {
  cursor: pointer;
}

.absolute-right {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
}

</style>