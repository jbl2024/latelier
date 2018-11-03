<template>
  <div class="new-label">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color>
      <v-card>
        <v-card-title class="headline">Créer un label</v-card-title>
        <v-card-text>
          <v-form v-model="valid" class="form" v-on:submit.prevent>
            <v-text-field v-model="name" v-focus :rules="nameRules" label="Nom" required v-on:keyup.enter="create()"></v-text-field>

            <v-btn color="primary" @click="showSelectColor = true" class="btn-color">
              Choisir une couleur
            </v-btn>
            <div class="color" ref="color" :style="getColor(color)" @click="showSelectColor = true">
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="create" :disabled="!valid">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      valid: false,
      showDialog: false,
      showSelectColor: false,
      name: '',
      color: '#000',
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
      Meteor.call('labels.create', this.projectId, this.name, this.color, '#000', (error, result) => { 
        if (error) {
          console.log(error)
          return;
        }
      });
      this.showDialog = false;
    },

    getColor (label) {
      return 'background-color: ' + label.color;
    },

    onSelectColor (color) {
      var hex = color.hex || 'white';
      this.$refs.color.style.backgroundColor = hex;
      this.color = hex;
    },

  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}

.color {
  width: 100%;
  height: 32px;
  border: 1px solid black;
  margin-bottom: 24px;
  cursor: pointer;
}

.btn-color {
  margin-left: 0;
  width: 100%;
}

</style>