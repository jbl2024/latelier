<template>
  <div class="new-label">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouveau label</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-focus v-model="name" v-on:keyup.enter="create()"></md-input>
        </md-field>
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
import { Labels } from '/imports/api/labels/labels.js'

export default {
  props: {
    projectId: String
  },
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
      Meteor.call('labels.create', this.projectId, this.name, '#000', (error, result) => { 
        if (error) {
          console.log(error)
          return;
        }
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

</style>