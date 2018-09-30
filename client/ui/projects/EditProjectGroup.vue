<template>
  <div class="edit-project-group">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Editer la catégorie</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-focus v-model="projectGroup.name" v-on:keyup.enter="updateName()"></md-input>
        </md-field>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="showDialog = false">Annuler</md-button>
        <md-button class="md-raised md-accent" @click="remove">Supprimer</md-button>
        <md-button class="md-raised md-primary" @click="updateName">Modifier</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'

export default {
  props: {
    projectGroupId: String
  },
  data () {
    return {
      showDialog: false,
      projectGroup: {},
      name: ''
    }
  },
  meteor: {
    projectGroup: {
      params () {
        return {
          id: this.projectGroupId
        };
      },
      deep: false,
      update ({id}) {
        return ProjectGroups.findOne({ _id: id}) || {};
      }
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    updateName () {
      var that = this;
      Meteor.call('projectGroups.updateName', this.projectGroup._id, this.projectGroup.name, (error, result) => {
        if (error) {
          console.log(error)
          return;
        }
        that.showDialog = false;
      });
    },

    remove () {
      var that = this;
      if (confirm('Voulez-vous supprimer définitivement cette catégorie ?')) {
        Meteor.call('projectGroups.remove', this.projectGroup._id, (error, result) => { 
          if (error) {
            console.log(error)
            return;
          }
          that.showDialog = false;
        });
      }
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