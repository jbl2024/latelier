<template>
  <div class="select-group">

    <v-dialog :value="active" @input="$emit('update:active')" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <new-project-group ref="newProjectGroup" :organizationId="organizationId"></new-project-group>  
      <v-card>
        <v-card-title class="headline">Choisir une catégorie</v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="group in groups">
              <v-list-tile :key='group._id' @click="selectGroup(group)">
                <v-list-tile-avatar >
                  <v-icon>folder</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="cursor">
                  <v-list-tile-title>{{ group.name }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
            <v-list-tile @click="$refs.newProjectGroup.open()">
              <v-list-tile-avatar >
                <v-icon>folder</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content class="cursor">
                <v-list-tile-title>Créer...</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">{{ this.$t('Cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'

export default {
  props: {
    organizationId: String,
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

</style>