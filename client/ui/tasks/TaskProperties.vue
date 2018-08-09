<template>

<div class="task-properties">

  <choose-person @choose="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog">

  </choose-person>
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
  data() {
    return {
      showChooseAssignedToDialog: false,
    };
  },
  methods: {

    chooseAssignedTo () {

    },

    onChooseAssignedTo (user) {
      Meteor.call('tasks.assignTo', this.task._id, user._id, (err, res) => {
      });
    },

    removeAssignedTo () {
      Meteor.call('tasks.removeAssignedTo', this.task._id, (err, res) => {
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