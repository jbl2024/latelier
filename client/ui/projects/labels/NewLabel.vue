<template>
  <div class="new-label">

    <md-dialog :md-active.sync="showDialog">
      <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color> 
      <md-dialog-title>Nouveau label</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-focus v-model="name" v-on:keyup.enter="create()"></md-input>
        </md-field>
        <div class="color" ref="color" :style="getColor(color)" @click="showSelectColor = true">
        </div>
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
      showSelectColor: false,
      name: '',
      color: '#000'
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

</style>