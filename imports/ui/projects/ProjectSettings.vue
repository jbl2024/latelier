<template>
  <div class="project-settings"> 

    <div v-if="!$subReady.project">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.project" class="project-wrapper"> 
      <md-toolbar class="toolbar">
        <md-button class="md-icon-button" :to="{ name: 'project', params: { projectId: project._id }}">
            <md-icon>arrow_back
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
      </md-toolbar>

      <md-tabs md-sync-route>
        <md-tab id="tab-general" md-label="Informations générales">
          <project-settings-general :project="project"></project-settings-general>
        </md-tab>

        <md-tab id="tab-users" md-label="Utilisateurs & permissions">
          <project-settings-manage-users :project="project" class="users"></project-settings-manage-users>
        </md-tab>
      </md-tabs> 

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
  },
  created () {
  },
  beforeDestroy() {
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
  }
}
</script>

<style scoped>


.toolbar {
  background-color: white;
}

.search {
  max-width: 300px;
}

.md-content { 
  padding: 8px;
}

.project-settings {
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100%;
}

.users {
  overflow-y: scroll;
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