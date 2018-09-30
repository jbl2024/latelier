<template>
  <div class="new-organization">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouvelle organisation</md-dialog-title>

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
import { Organizations } from '/imports/api/organizations/organizations.js'

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
      Meteor.call('organizations.create', this.name, (error, result) => { 
        if (error) {
          console.log(error)
          return;
        }
        this.$router.push({ name: 'projects-page', params: { organizationId: result }}) 
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