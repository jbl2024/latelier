<template>

<div class="task-properties">

  <choose-person @choose="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog">

  </choose-person>
  <md-list class="md-double-line">
    <md-subheader>Responsabilités</md-subheader>

    <div class="md-elevation-1">
      <md-list-item>
       <md-avatar v-show="task.assignedTo" class="md-avatar-icon" :class="isOnline(task.assignedTo)">
          <md-ripple>{{ formatUserLetters(task.assignedTo) }}</md-ripple>
        </md-avatar>
        <div class="md-list-item-text cursor" @click="showChooseAssignedToDialog = true">
          <span v-show="task.assignedTo">Assignée à </span>
          <span v-show="!task.assignedTo">Non assignée </span>
          <span>{{ formatUser(task.assignedTo) }}</span>
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

      <md-list-item>
        <div class="md-list-item-text">
          <span>Date de fin</span>
          <span></span>
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
  watch: { 
    task: function(task, oldTask) { // watch it
    }
  },
  data() {
    return {
      showChooseAssignedToDialog: false
    };
  },
  methods: {

    chooseAssignedTo () {

    },

    onChooseAssignedTo (user) {
      Meteor.call('tasks.assignTo', this.task._id, user._id, (err, res) => {
        this.task.assignedTo = Tasks.findOne({_id: this.task._id}).assignedTo;
      });
    },

    removeAssignedTo () {
      Meteor.call('tasks.removeAssignedTo', this.task._id, (err, res) => {
        this.task.assignedTo = Tasks.findOne({_id: this.task._id}).assignedTo;
      });
    }
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