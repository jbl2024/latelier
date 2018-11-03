<template>
  <div class="select-organization">

    <v-dialog v-model="active" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Choisir une organisation</v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="organization in organizations">
              <v-list-tile :key='organization._id' @click="selectOrganization(organization)">
                <v-list-tile-avatar>
                  <v-icon>domain</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ organization.name }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      return Organizations.find({orphans: {$exists: false}}, {sort: {name: 1}});
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