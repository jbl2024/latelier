<template>
  <div class="select-label">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Sélectionner un label</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="label in labels" @click="selectLabel(label)"
              :key="label._id">
            <md-icon :style="getColor(label)">label</md-icon>
            <span class="md-list-item-text">{{label.name}}</span>
          </md-list-item>
        </md-list>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="showDialog = false">Annuler</md-button>
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
    labels () {
      return Labels.find({}, {sort: {name: 1}});
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },

    selectLabel (label) {
      this.showDialog = false;
      this.$emit('select', label);
    },

    getColor (label) {
      return 'color: ' + label.color;
    }
  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 24px;
}

.color {
  width: 100%;
  height: 32px;
  margin-bottom: 24px;
  cursor: pointer;
}

</style>