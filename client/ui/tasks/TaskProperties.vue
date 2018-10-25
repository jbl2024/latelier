<template>

<div class="task-properties">

  <select-user @select="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog"></select-user>
  <select-date @select="onSelectDueDate" :active.sync="showSelectDueDate"></select-date>
  <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate"></select-date>
  
  <v-subheader>Responsabilités</v-subheader>
  <v-list class="elevation-1">
    <v-list-tile @click="showChooseAssignedToDialog = true">
      <v-list-tile-avatar :color="isOnline(task.assignedTo)">
        <span class="">{{ formatUserLetters(task.assignedTo) }}</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
      <v-list-tile-title>
        <span v-show="task.assignedTo">Assignée à </span>
        <span>{{ formatUser(task.assignedTo) }}</span>
        <span v-show="!task.assignedTo">Non assignée </span>
      </v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn icon flat @click.stop="removeAssignedTo">
          <v-icon color="grey">delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>

  <v-subheader>Dates</v-subheader>
  <v-list two-line class="elevation-1">
      <v-list-tile @click="showSelectStartDate = true">
        <v-list-tile-avatar>
          <v-icon>calendar_today</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>Date de début</v-list-tile-title>
          <v-list-tile-sub-title>
            <span v-show="task.startDate">{{ formatDate(task.startDate) }}</span>
            <span v-show="!task.startDate">Aucune</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn flat icon @click.stop="onSelectStartDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-divider></v-divider>

      <v-list-tile @click="showSelectDueDate = true">
        <v-list-tile-avatar>
          <v-icon>alarm_on</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>Date de fin</v-list-tile-title>
          <v-list-tile-sub-title>
            <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
            <span v-show="!task.dueDate">Aucune</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn flat icon @click.stop="onSelectDueDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
  </v-list>
  <v-subheader>Pièces jointes</v-subheader>
  <task-attachments :task="task"></task-attachments>

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
      Meteor.call('tasks.setStartDate', this.task._id, date);
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

.cursor {
  cursor: pointer;
}

</style>