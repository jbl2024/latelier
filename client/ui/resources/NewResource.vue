<template>
  <div class="new-resource">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouvelle ressource</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-focus v-model="name" v-on:keyup.enter="create()"></md-input>
        </md-field>
        <md-field>
            <label>Description</label>
            <md-textarea ref="description" v-model="description" @keyup.ctrl.enter="create()"></md-textarea>
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
import { Resources } from '/imports/api/resources/resources.js'

export default {
  props: {
    organizationId: {
      type: String,
      defaultValue: '0'
    }
  },
  data () {
    return {
      showDialog: false,
      name: '',
      description: ''
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    create () {
      Meteor.call('resources.create', this.organizationId, this.name,  this.description, (error, result) => { 
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