<template>
  <div class="edit-label">

    <md-dialog :md-active.sync="showDialog">
      <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color> 
      <md-dialog-title>Editer le label</md-dialog-title>

      <div class="content">
        <md-field>
            <label>Nom</label>
            <md-input v-focus v-model="label.name" v-on:keyup.enter="updateName()"></md-input>
        </md-field>
        <div class="color" :style="getColor(label)" @click="showSelectColor = true">

        </div>
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
import { Labels } from '/imports/api/labels/labels.js'

export default {
  props: {
    labelId: String
  },
  data () {
    return {
      showDialog: false,
      showSelectColor: false,
      label: {},
      name: ''
    }
  },
  meteor: {
    label: {
      params () {
        return {
          id: this.labelId
        };
      },
      deep: false,
      update ({id}) {
        return Labels.findOne({ _id: id}) || {};
      }
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },
    updateName () {
      Meteor.call('labels.updateName', this.label._id, this.label.name, (error, result) => { 
        if (error) {
          console.log(error)
          return;
        }
        this.showDialog = false;
      });
    },

    remove () {
      if (confirm('Voulez-vous supprimer définitivement ce label ?')) {
        Meteor.call('labels.remove', this.label._id, (error, result) => { 
          if (error) {
            console.log(error)
            return;
          }
          this.showDialog = false;
        });
      }
    },

    getColor (label) {
      return 'background-color: ' + label.color;
    },

    onSelectColor (color) {
      var hex = color.hex || 'white';
      this.$refs.color.style.backgroundColor = hex;
      this.label.color = hex;
      Meteor.call('labels.updateColor', this.label._id, hex);
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
  height: 64px;
}

</style>