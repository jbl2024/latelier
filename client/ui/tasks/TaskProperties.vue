<template>

<div class="task-properties">

  <choose-person @choose="onChooseAssignedTo" :active.sync="showChooseAssignedToDialog">

  </choose-person>
  <md-list class="md-double-line">
    <md-subheader>Responsabilités</md-subheader>

    <div class="md-elevation-1">
      <md-list-item>
        <div class="md-list-item-text cursor" @click="showChooseAssignedToDialog = true">
          <span>Assignée à </span>
          <span>jerome blondon</span>
        </div>
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
import moment from 'moment';
import 'moment/locale/fr'

export default {
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

    onChooseAssignedTo (person) {
      console.log(person);
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