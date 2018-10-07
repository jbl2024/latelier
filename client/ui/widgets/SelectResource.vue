<template>
  <div class="select-resource">

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Sélectionner une ressource</md-dialog-title>

      <div class="content">
        <md-list class="md-double-line">
          <md-list-item v-for="resource in resources" @click="selectResource(resource)"
              :key="resource._id">
            <md-avatar class="md-avatar-icon md-primary">
              <md-icon>category</md-icon>
            </md-avatar>
            <div class="md-list-item-text pointer">
              <span>{{ resource.name }}</span>
              <span>{{ resource.description }}</span>
            </div>
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
import { Resources } from '/imports/api/resources/resources.js'

export default {
  props: {
    resourceId: String
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
    resources () {
      return Resources.find({}, {sort: {name: 1}});
    }
  },
  methods: {
    open () {
      this.showDialog = true;
    },

    selectResource (resource) {
      this.showDialog = false;
      this.$emit('select', resource);
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