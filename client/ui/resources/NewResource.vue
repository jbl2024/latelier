<template>
  <div class="new-resource">

    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Nouvelle ressource</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field v-model="name" v-focus :rules="nameRules" label="Nom" required></v-text-field>
            <v-textarea v-model="description" label="Description" @keyup.ctrl.enter="create()" required></v-textarea>
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
      valid: false,
      name: '',
      description: '',
      nameRules: [
        v => !!v || "Le nom est obligatoire",
        v => v.length > 1 || "Le nom est trop court"
      ]
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