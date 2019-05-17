<template>
  <div class="edit-resource">

    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Editer la ressource</v-card-title>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-text-field v-model="name" v-focus :rules="nameRules" label="Nom" @keyup.enter="update()" required></v-text-field>
            <v-textarea v-model="description" label="Description" @keydown.shift.enter="update()" required></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="info" @click="update" :disabled="!valid">Modifier</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Resources } from '/imports/api/resources/resources.js'

export default {
  data () {
    return {
      showDialog: false,
      resourceId: '',
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
    open (resourceId) {
      this.resourceId = resourceId;
      const resource = Resources.findOne({_id: resourceId});
      this.name = resource.name;
      this.description = resource.description
      this.showDialog = true;
    },
    update () {
      Meteor.call('resources.update', this.resourceId, this.name,  this.description, (error, result) => { 
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