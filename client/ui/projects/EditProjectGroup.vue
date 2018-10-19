<template>
  <div class="edit-project-group">

    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Editer la catégorie</v-card-title>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-text-field v-model="projectGroup.name" :rules="nameRules" label="Nom" required v-on:keyup.enter="updateName()"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="warning" @click="remove" :disabled="!valid">Supprimer</v-btn>
          <v-btn color="info" @click="updateName" :disabled="!valid">Modifier</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      valid: false,
      name: '',
      nameRules: [
        v => !!v || "Le nom est obligatoire"
      ]
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
      Meteor.call('projectGroups.updateName', this.projectGroup._id, this.projectGroup.name, (error, result) => {
        if (error) {
          console.log(error)
          return;
        }
        this.showDialog = false;
      });
    },

    remove () {
      if (confirm('Voulez-vous supprimer définitivement cette catégorie ?')) {
        this.showDialog = false;
        Meteor.call('projectGroups.remove', this.projectGroup._id, (error, result) => { 
          if (error) {
            console.log(error)
            return;
          }
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