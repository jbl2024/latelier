<template>
  <div class="project">
    <div v-if="!$subReady.project">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.project"> 
      <md-toolbar class="toolbar">
        <md-button class="md-icon-button" :to="{ name: 'projects'}">
            <md-icon>home</md-icon>
        </md-button>
        <span class="md-title" v-show="!editProjectName" @click="startUpdateProjectName">
          {{ project.name }}
        </span>
        <span class="md-title edit-project-name" v-show="editProjectName">
          <input @focus="$event.target.select()" type="text" v-model="project.name" v-on:keyup.enter="updateProjectName">
          <md-button class="md-icon-button" @click.native="updateProjectName">
            <md-icon>check_circle</md-icon>
          </md-button>

          <md-button class="md-icon-button" @click.native="cancelUpdateProjectName">
            <md-icon>cancel</md-icon>
          </md-button>
        </span>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button settings">
            <md-icon>more_vert</md-icon>
          </md-button>
        </div>
      </md-toolbar>

      <kanban ref="container" class="container" @click="showProperties=false" v-bind:style="{ height: getHeight() + 'px' }" :projectId="projectId"></kanban>

      <md-drawer :md-active="showProperties" md-right md-persistent="full" class="drawer-properties md-layout-item md-small-size-100 md-medium-size-40 md-large-size-40 md-xlarge-size-40">
        <task-properties :task="selectedTask"></task-properties>
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

export default {
  mounted () {
    window.addEventListener('resize', this.handleResize)
    this.$events.listen('task-selected', task => {
      this.showProperties = true;
      this.selectedTask = task;
    });
    this.$events.listen('close-properties', task => {
      this.showProperties = false;
    });
  },
  beforeDestroy() {
    this.$events.off('task-selected');
    this.$events.off('close-properties');
    window.removeEventListener('resize', this.handleResize)
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
      showProperties: false,
      selectedTask: {}
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
    handleResize () {
      this.$refs.container.$el.style.height = this.getHeight() + 'px';
    },

    startUpdateProjectName () {
      this.savedProjectName = this.project.name;
      this.editProjectName = true
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

    getHeight () {
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      var toolbarHeight = 132;
      if (h > toolbarHeight) {
        return h - toolbarHeight;
      }
      return h;
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

.drawer-properties {
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

.md-drawer {
  /* width: 600px; */
}

.toolbar {
  background-color: white;
}


.md-content { 
  padding: 8px;
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
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: auto;
  }
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