<template>
  <div class="project-settings-general"> 
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate"  :disableTime="true"></select-date>
    <select-group @select="onSelectGroup" :active.sync="showSelectGroup"></select-group>

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

      <md-subheader>Catégories

        <md-button class="md-icon-button" @click="showSelectGroup = true">
        <md-icon>add</md-icon>
        <md-tooltip md-delay="300">Ajouter une catégorie</md-tooltip>
        </md-button>
 
      </md-subheader>
      <div class="md-elevation-1">
        <div v-for="group in assignedGroups" :key="group._id">
          <md-list-item>
            <md-avatar class="md-avatar-icon">
              <md-icon>folder</md-icon>
            </md-avatar>
            <div class="md-list-item-text">
              {{group.name}}
            </div>
            <md-button class="md-icon-button md-list-action" @click.stop="removeGroup(group)">
              <md-icon>delete</md-icon>
              <md-tooltip md-delay="300">Retirer</md-tooltip>
            </md-button>
          </md-list-item>
          <md-divider></md-divider> 
        </div>
      </div>

    </md-list>
</div>
</template>

<script>
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import DatesMixin from '/imports/ui/mixins/DatesMixin.js'

export default {
  name: 'project-settings-general',
  mixins: [DatesMixin],
  props: {
    project: Object
  },
  data () {
    return {
      showSelectStartDate: false,
      showSelectEndDate: false,
      showSelectGroup: false,
    }
  },
  meteor: {
    $subscribe: {
      'projectGroups': function() {
        return [];
      }
    },
  
    assignedGroups: {
      params () {
        return {
          project: this.project
        };
      },
      deep: false,
      update ({project}) {
        if (project) {
          return ProjectGroups.find({projects: project._id}, {sort: {name: 1}});
        }
      }
    },
  },
  methods: {
    onSelectStartDate (date) {
      Meteor.call('projects.setStartDate', this.project._id, date);
    },

    onSelectEndDate (date) {
      Meteor.call('projects.setEndDate', this.project._id, date);
    },

    removeGroup (group) {
      Meteor.call('projectGroups.removeProject', group._id, this.project._id);
    },

    onSelectGroup (group) {
      Meteor.call('projectGroups.addProject', group._id, this.project._id);
    }
  }
}
</script>

<style scoped>

.groups {
  width: 100%;
}
</style>