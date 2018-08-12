<template>
  <div class="select-group">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir un groupe</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="group in groups" :key="group._id" class="cursor" @click="selectGroup(group)">
            <span class="md-list-item-text">{{ group.name }}</span>

          </md-list-item>
        </md-list>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
      </md-dialog-actions>
    </md-dialog>  

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