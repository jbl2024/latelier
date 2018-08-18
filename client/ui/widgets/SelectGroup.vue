<template>
  <div class="select-group">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une catégorie</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="group in groups" :key="group._id" class="cursor" @click="selectGroup(group)">
            <md-icon>folder</md-icon>
            <span class="md-list-item-text">{{ group.name }}</span>

          </md-list-item>
          <md-list-item @click="$refs.newProjectGroup.open()" v-show="groups.length > 0">
            <md-icon>add</md-icon>
            <span class="md-list-item-text">Créer...</span>
          </md-list-item>
        </md-list>

        <md-empty-state v-show="groups.length == 0"
          md-icon="folder"
          md-label="Aucune catégorie"
          md-description="Vous pouvez créer une catégorie.">
          <md-button class="md-primary md-raised" @click="$refs.newProjectGroup.open()">Créer une catégorie</md-button>
        </md-empty-state>

      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
      </md-dialog-actions>
    </md-dialog>  
    <new-project-group ref="newProjectGroup"></new-project-group>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'

export default {
  props: {
    active: Boolean,
  },
  data () {
    return {
    }
  },
  meteor: {
    groups () {
      return ProjectGroups.find();
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    selectGroup (group) {
      this.$emit('update:active', false);
      this.$emit('select', group);
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