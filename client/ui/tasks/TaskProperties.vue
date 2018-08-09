<template>

<div class="task-properties">

  <choose-person @choose="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog"></choose-person>
  <select-date @select="onSelectDueDate" :active.sync="showSelectDueDate"></select-date>
  
  <md-list class="md-double-line">
    <md-subheader>Responsabilités</md-subheader>

    <div class="md-elevation-1">
      <md-list-item>
       <md-button class="md-icon-button md-avatar-icon" v-show="task.assignedTo" @click="showChooseAssignedToDialog = true">
        <md-avatar  class="md-avatar-icon" :class="isOnline(task.assignedTo)">
            <md-ripple>{{ formatUserLetters(task.assignedTo) }}</md-ripple>
        </md-avatar>
       </md-button>
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
        <div class="md-list-item-text">
          <span>Date de début</span>
          <span></span>
        </div>
      </md-list-item>

      <md-divider></md-divider>

      <md-list-item class="cursor" @click="showSelectDueDate = true">
        <div class="md-list-item-text">
          <span>Date de fin</span>
          <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
        </div>
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