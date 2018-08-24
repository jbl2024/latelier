<template>
  <div class="project"> 

    <div v-if="!$subReady.project">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.project" class="project-wrapper"> 

      <md-toolbar class="toolbar">
        <md-button class="md-icon-button" :to="{ name: 'projects-page'}">
            <md-icon>home
              <md-tooltip md-delay="300">Accueil</md-tooltip>
            </md-icon>
        </md-button>
        <span class="md-title" v-show="!editProjectName" @click="startUpdateProjectName">
          {{ project.name }}
        </span>        
        <span class="md-title edit-project-name" v-show="editProjectName">
          <input @focus="$event.target.select()" type="text" ref="name" v-model="project.name" v-on:keyup.enter="updateProjectName">
          <md-button class="md-icon-button" @click.native="updateProjectName">
            <md-icon>check_circle</md-icon>
          </md-button>

          <md-button class="md-icon-button" @click.native="cancelUpdateProjectName">
            <md-icon>cancel</md-icon>
          </md-button>
        </span>

        <div class="md-toolbar-section-end">
          <md-field class="search" md-clearable>
            <md-icon>search</md-icon>
            <md-input placeholder="Rechercher..." v-on:input="debouncedFilter"/>
          </md-field>

          <md-button class="md-icon-button" :to="{ name: 'project-timeline', params: { projectId: project._id }}">
              <md-icon>timeline
                <md-tooltip md-delay="300" md-direction="bottom">Planning</md-tooltip>
              </md-icon>
          </md-button>
          <md-button class="md-icon-button" :to="{ name: 'project-settings', params: { projectId: project._id }}">
              <md-icon>settings
                <md-tooltip md-delay="300" md-direction="bottom">Paramètres</md-tooltip>
              </md-icon>
          </md-button>
        </div>
      </md-toolbar>

      <div class="container-wrapper">
        <kanban ref="container" class="container" @click="showTaskDetail=false" :projectId="projectId"></kanban>
      </div>

      <md-drawer :md-active="showTaskDetail" md-right md-persistent="full" class="drawer-task-detail md-layout-item md-small-size-100 md-medium-size-40 md-large-size-40 md-xlarge-size-40">
        <task-detail :taskId="selectedTask._id"></task-detail>
      </md-drawer>

      <new-list ref="newList" :project-id="projectId"></new-list>  
      <md-speed-dial class="absolute-right">
        <md-speed-dial-target @click="newList">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
      </md-speed-dial>

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
    this.$events.listen('task-selected', task => {
      if (!task) {
        return;
      }
      this.showTaskDetail = true;
      this.selectedTask = task;
    });
    this.$events.listen('close-task-detail', task => {
      this.$events.fire('task-selected', null);
      this.showTaskDetail = false;
    });
  },
  created () {
    this.debouncedFilter = debounce((val) => { this.$events.fire('filter-tasks', val)}, 400);
  },
  beforeDestroy() {
    this.$events.off('task-selected');
    this.$events.off('close-task-detail');
  },
  props: {
    projectId: {
      type: String,
      default: '0'
    }
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
      }
    },
    project () {
      return Projects.findOne();
    }
  },
  methods: {
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
    },
    newList () {
      this.$refs.newList.open();
    },
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

.drawer-task-detail {
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
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
  z-index: 1000;
}

</style>