<template>
  <div class="select-color">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une couleur</md-dialog-title>

      <div class="content">
        <swatches-picker :value="color" @input="selectColor"/>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
      </md-dialog-actions>
    </md-dialog>  
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Swatches } from 'vue-color'

export default {
  components: {
    'swatches-picker': Swatches,
  },
  props: {
    active: Boolean,
  },
  data () {
    return {
      color: ''
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    selectColor (color) {
      this.$emit('update:active', false);
      this.$emit('select', color);
    }
  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}

</style>