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

  <md-divider></md-divider>
  <div class="description">
    <div v-show="!editDescription && task.description && task.description.length > 0" @click="startEditDescription">
      <pre>{{ task.description}}</pre>
    </div>
    <div v-show="!task.description && !editDescription" @click="startEditDescription">
      Aucune description
    </div>

    <div v-show="editDescription">
      <md-field>
        <label>Description</label>
        <md-textarea v-model="task.description"></md-textarea>
      </md-field>
      <md-button class="md-icon-button" @click.native="updateDescription">
        <md-icon>check_circle</md-icon>
      </md-button>

      <md-button class="md-icon-button" @click.native="cancelUpdateDescription">
        <md-icon>cancel</md-icon>
      </md-button>

    </div>
    
  </div>
  <md-divider></md-divider>

  <md-tabs md-sync-route>
    <md-tab id="tab-notes" md-label="Notes">
      Notes
    </md-tab>

    <md-tab id="tab-properties" md-label="Propriétés">
      Pages tab
      <p>Unde provident nemo reiciendis officia, possimus repellendus. Facere dignissimos dicta quis rem. Aliquam aspernatur dolor atque nisi id deserunt laudantium quam repellat.</p>
    </md-tab>

  </md-tabs>  
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
      editDescription: false
    };
  },
  methods: {
    requestClose () {
      this.$events.fire('close-properties');
    },
    deleteTask (taskId) {
      Meteor.call('tasks.remove', taskId);
      this.$events.fire('close-properties');
    },
    startEditDescription () {
      this.savedDescription = this.task.description;
      this.editDescription = true;
    },

    updateDescription () {
      this.editDescription = false;
      Meteor.call('tasks.updateDescription', this.task._id, this.task.description);
    },

    cancelUpdateDescription () {
      this.editDescription = false;
      this.task.description = this.savedDescription;
    }
  }
};
</script>

<style scoped>

.description, .md-tabs {
  margin: 24px;
}

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}
</style>