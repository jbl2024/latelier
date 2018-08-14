<template>

<div class="project-groups">
  <new-project-group ref="newProjectGroup"></new-project-group>  
  <edit-project-group ref="editProjectGroup" :projectGroupId="selectedProjectGroupId"></edit-project-group>
  <div v-if="$subReady.projectGroups">
    <md-list>
      <md-subheader>Catégories</md-subheader>
      <md-list-item v-for="group in groups" 
          :key="group._id" 
          @click="(e) => {selectGroup(e, group)}" 
          @mouseover="showButtons = group._id" 
          @mouseleave="showButtons = null">
        <md-icon :class="getColor(group)">folder</md-icon>
        <span class="md-list-item-text">{{group.name}}</span>

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
</div>

</template>

<script>
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'
import { Projects } from '/imports/api/projects/projects.js'
import showdown from 'showdown';

export default {
  data() {
    return {
      showButtons: '',
      selectedProjectGroupId: ''
    };
  },
  meteor: {
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      'projectGroups': function() {
        // Here you can use Vue reactive properties
        return [] // Subscription params
      }
    },
    groups () {
      return ProjectGroups.find({}, {sort: {name: 1}});
    },
  },
  methods: {
    removeGroup (group) {
      Meteor.call('projectGroups.remove', group._id);
    },

    selectGroup (event, group) {
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