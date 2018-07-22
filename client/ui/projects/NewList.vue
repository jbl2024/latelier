<template>
  <div class="new-list">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouvelle liste</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-model="name" v-on:keyup.enter="create()"></md-input>
        </md-field>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click="create">Créer</md-button>
        <md-button class="md-primary" @click="showDialog = false">Annuler</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Lists } from '/imports/api/lists/lists.js'

export default {
  props: {
    projectId: {
      type: String,
      default: '0'
    }
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
      Meteor.call('lists.insert', this.projectId, this.name, (error, result) => { 
        if (error) {
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