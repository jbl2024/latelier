<template>

<div class="task-properties">
  <md-toolbar class="md-transparent" md-elevation="0">
    <div class="md-toolbar-section-start">
      <md-button class="md-icon-button md-dense" @click="requestClose()">
        <md-icon>close</md-icon>
      </md-button>
      <span>{{ task.name}}</span>
    </div>
    <div class="md-toolbar-section-end">
      <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
        <md-button md-menu-trigger class="md-icon-button">
          <md-icon>more_vert</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item @click="deleteTask(task._id)">Supprimer</md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
  </md-toolbar>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'


export default {
  props: {
    task: {
      type: Object
    },
    showProperties: {
      type: Boolean
    }
  },
  data() {
    return {
    };
  },
  methods: {
    requestClose () {
      this.$events.fire('close-properties');
    },
    deleteTask (taskId) {
      Meteor.call('tasks.remove', taskId);
      this.$events.fire('close-properties');
    }
  }
};
</script>

<style scoped>
</style>