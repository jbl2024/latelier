<template>
  <div class="new-project">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouveau projet</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-model="name"></md-input>
        </md-field>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click="create">Crêer</md-button>
        <md-button class="md-primary" @click="showDialog = false">Annuler</md-button>
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
      name: ''
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    create () {
      console.log(this.name);
      Meteor.call('projects.insert', this.name);
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
</style>