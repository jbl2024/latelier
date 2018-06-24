<template>
  <div class="new-project">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Nouveau projet</md-dialog-title>


      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        <md-button class="md-primary" @click="showDialog = false">Save</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  data () {
    return {
      showDialog: false
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    }
  }
}
</script>

<style scoped>
</style>