<template>
  <div class="select-organization">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une organisation</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="organization in organizations" :key="organization._id" class="cursor" @click="selectOrganization(organization)">
            <md-icon>folder</md-icon>
            <span class="md-list-item-text">{{ organization.name }}</span>
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
import { Organizations } from '/imports/api/organizations/organizations.js'

export default {
  props: {
    active: Boolean,
  },
  data () {
    return {
    }
  },
  meteor: {
    organizations () {
      return Organizations.find({}, {sort: {name: 1}});
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    selectOrganization (organization) {
      this.$emit('update:active', false);
      this.$emit('select', organization);
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