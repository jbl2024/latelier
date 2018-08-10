<template>
  <div class="project-info"> 
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate"  :disableTime="true"></select-date>

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

        <md-list class="md-double-line">
          <md-subheader>Dates</md-subheader>
          <div class="md-elevation-1">
            <md-list-item class="cursor" @click="showSelectStartDate = true">
              <md-avatar class="md-avatar-icon">
                <md-icon>calendar_today</md-icon>
              </md-avatar>
              <div class="md-list-item-text">
                <span>Date de début</span>
                <span>
                  <span v-show="project.startDate">{{ formatDate(project.startDate) }}</span>
                  <span v-show="!project.startDate">Aucune</span>
                </span>
              </div>
              <md-button class="md-icon-button md-list-action" @click.stop="onSelectStartDate(null)">
                <md-icon>delete</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
            </md-list-item>

            <md-divider></md-divider>

            <md-list-item class="cursor" @click="showSelectEndDate = true">
              <md-avatar class="md-avatar-icon">
                <md-icon>alarm_on</md-icon>
              </md-avatar>
              <div class="md-list-item-text">
                <span>Date de fin</span>
                <span>
                  <span v-show="project.endDate">{{ formatDate(project.endDate) }}</span>
                  <span v-show="!project.endDate">Aucune</span>
                </span>
              </div>
              <md-button class="md-icon-button md-list-action" @click.stop="onSelectEndDate(null)">
                <md-icon>delete</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
            </md-list-item>
          </div>
        </md-list>


    </div>
</div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import DatesMixin from '/imports/ui/mixins/DatesMixin.js'

import debounce from 'lodash/debounce';

export default {
  mixins: [DatesMixin],
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
      showSelectStartDate: false,
      showSelectEndDate: false,
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

    onSelectStartDate (date) {
      Meteor.call('projects.setStartDate', this.project._id, date);
    },

    onSelectEndDate (date) {
      Meteor.call('projects.setEndDate', this.project._id, date);
    }
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