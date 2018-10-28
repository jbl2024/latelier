<template>

<div class="project-groups">
  <new-project-group ref="newProjectGroup" :organizationId="organizationId"></new-project-group>  
  <edit-project-group ref="editProjectGroup" :projectGroupId="selectedProjectGroupId"></edit-project-group>


  <v-list dense class="pt-0">
    <v-subheader>Catégories</v-subheader>
    <v-list-tile 
        @click="selectGroup(group)"
        v-for="group in groups"
        :key="group._id" 
        @mouseover="showButtons = group._id" 
        @mouseleave="showButtons = null">

      <v-list-tile-action>
        <v-icon :style="getColor(group)">folder</v-icon>
      </v-list-tile-action>

      <v-list-tile-content class="pointer">
        <v-list-tile-title :class="getColor(group)">{{ group.name }}</v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-btn icon ripple @click.stop="openMenu(group._id)" v-show="showButtons === group._id"> 
          <v-icon color="grey lighten-1">settings</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile @click="$refs.newProjectGroup.open()"> 

      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>

      <v-list-tile-content>
        <v-list-tile-title>Créer...</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>

</div>

</template>

<script>
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    organizationId: {
      type: String,
      value: '0'
    }
  },
  data() {
    return {
      showButtons: '',
      selectedProjectGroupId: ''
    };
  },
  meteor: {
    groups () {
      return ProjectGroups.find({}, {sort: {name: 1}});
    },
  },
  methods: {
    removeGroup (group) {
      Meteor.call('projectGroups.remove', group._id);
    },

    selectGroup (group) {
      var selectedGroup = this.$store.state.selectedGroup;
      if (selectedGroup && selectedGroup._id === group._id) {
        this.$store.dispatch('setSelectedGroup', null);
      } else {
        this.$store.dispatch('setSelectedGroup', group);
      }
    },

    getColor (group) {
      var selectedGroup = this.$store.state.selectedGroup;
      if (selectedGroup && selectedGroup._id === group._id) {
        return 'selected'
      }
      return '';
    },

    openMenu (id) {
      this.selectedProjectGroupId = id;
      this.$refs.editProjectGroup.open();
    }
  }
};
</script>

<style scoped>
.selected {
  font-weight: bold;
}
</style>