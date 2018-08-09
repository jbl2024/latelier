<template>

<div class="task-properties">

  <choose-person @choose="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog"></choose-person>
  <select-date @select="onSelectDueDate" :active.sync="showSelectDueDate"></select-date>
  <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate"></select-date>
  
  <md-list class="md-double-line">
    <md-subheader>Responsabilités</md-subheader>

    <div class="md-elevation-1">
      <md-list-item>
        <md-avatar  class="md-avatar-icon" :class="isOnline(task.assignedTo)">
            {{ formatUserLetters(task.assignedTo) }}
        </md-avatar>
        <div class="md-list-item-text cursor" @click="showChooseAssignedToDialog = true">
          <span v-show="task.assignedTo">Assignée à </span>
          <span>{{ formatUser(task.assignedTo) }}</span>
          <span v-show="!task.assignedTo">Non assignée </span>
        </div>
        <md-button class="md-icon-button md-list-action" @click="removeAssignedTo">
          <md-icon>delete</md-icon>
          <md-tooltip md-delay="300">Supprimer</md-tooltip>
        </md-button>
      </md-list-item>
    </div>

    <md-subheader>Dates</md-subheader>

    <div class="md-elevation-1">
      <md-list-item>
        <md-avatar class="md-avatar-icon">
          <md-icon>calendar_today</md-icon>
        </md-avatar>
        <div class="md-list-item-text">
          <span>Date de début</span>
          <span></span>
        </div>
      </md-list-item>

      <md-divider></md-divider>

      <md-list-item class="cursor">
        <md-avatar class="md-avatar-icon">
          <md-icon>alarm_on</md-icon>
        </md-avatar>
        <div class="md-list-item-text" @click="showSelectDueDate = true">
          <span>Date d'échéance</span>
          <span>
            <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
            <span v-show="!task.dueDate">Aucune</span>
          </span>
        </div>
        <md-button class="md-icon-button md-list-action" @click="onSelectDueDate(null)">
          <md-icon>delete</md-icon>
          <md-tooltip md-delay="300">Supprimer</md-tooltip>
        </md-button>

      </md-list-item>
    </div>
  </md-list>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';
import moment from 'moment';
import 'moment/locale/fr'

export default {
  mixins: [usersMixin],
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      showChooseAssignedToDialog: false,
      showSelectDueDate: false,
      showSelectStartDate: false,
    };
  },
  methods: {

    onChooseAssignedTo (user) {
      Meteor.call('tasks.assignTo', this.task._id, user._id);
    },

    removeAssignedTo () {
      Meteor.call('tasks.removeAssignedTo', this.task._id);
    },

    onSelectDueDate (date) {
      Meteor.call('tasks.setDueDate', this.task._id, date);
    },

    onSelectStartDate (date) {
      Meteor.call('tasks.seStartDate', this.task._id, date);
    },

    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },
  }
};
</script>

<style scoped>
.task-properties {
  margin: 12px;
}

.md-subheader {
  padding-left: 0;
}
.cursor {
  cursor: pointer;
}

</style>