<template>
  <div class="new-project-group">

    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Nouvelle catégorie</v-card-title>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-text-field v-model="name" v-focus :rules="nameRules" label="Nom" required v-on:keyup.enter="create()"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="info" @click="create" :disabled="!valid">Créer</v-btn>
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
    organizationId: {
      type: String,
      value: '0'
    }
  },
  data () {
    return {
      showDialog: false,
      valid: false,
      name: '',
      nameRules: [
        v => !!v || "Le nom est obligatoire",
        v => v.length > 0 || "Le nom est trop court"
      ]
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    create () {
      Meteor.call('projectGroups.create', this.organizationId, this.name, (error, result) => { 
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