<template>

<div class="project-groups">
  <new-project-group ref="newProjectGroup" :organizationId="organizationId"></new-project-group>  
  <edit-project-group ref="editProjectGroup" :projectGroupId="selectedProjectGroupId"></edit-project-group>
  <md-list>
    <md-subheader>Catégories</md-subheader>
    <md-list-item v-for="group in groups" 
        :key="group._id" 
        @mouseover="showButtons = group._id" 
        @mouseleave="showButtons = null">
      <md-icon >folder</md-icon>
      <span @click="selectGroup(group)" :class="getColor(group)">{{group.name}}</span>
      <md-button class="md-icon-button md-list-action" @click.stop="openMenu(group._id)" v-show="showButtons === group._id">
        <md-icon>settings</md-icon>
        <md-tooltip md-delay="300">Paramètres</md-tooltip>
      </md-button>

    </md-list-item>
    <md-list-item @click="$refs.newProjectGroup.open()">
      <md-icon>add</md-icon>
      <span class="md-list-item-text">Créer...</span>
    </md-list-item>
  </md-list>
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
        return 'selected md-list-item-text'
      }
      return 'md-list-item-text';
    },

    openMenu (id) {
      this.selectedProjectGroupId = id;
      this.$refs.editProjectGroup.open();
    }
  }
};
</script>

<style scoped>
.md-list-item {
  cursor: pointer;
}
.md-list-item:hover {
  background-color: #eee;
}

.selected {
  color: var(--md-theme-default-primary, #448aff) !important;
}

</style>