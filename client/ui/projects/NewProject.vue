<template>
  <div class="new-project">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouveau projet</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-model="name" v-on:keyup.enter="create()"></md-input>
        </md-field>
            <label>Modèle</label>
            <div>
              <md-radio v-model="projectType" value="none">Vide</md-radio>
              <md-radio v-model="projectType" value="kanban">Kanban</md-radio>
            </div>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="showDialog = false">Annuler</md-button>
        <md-button class="md-raised md-primary" @click="create">Créer</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'

export default {
  data () {
    return {
      showDialog: false,
      projectType: 'none',
      name: ''
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    create () {
      Meteor.call('projects.create', this.name, this.projectType, (error, result) => { 
        if (error) {
          return;
        }
        this.$router.push({ name: 'projects', params: { projectId: result }}) 
      });
      this.showDialog = false;
    }
  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}

.md-dialog {
}
</style>