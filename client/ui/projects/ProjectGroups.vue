<template>

<div class="project-groups">
  <new-project-group ref="newProjectGroup"></new-project-group>  
  <div v-if="$subReady.projectGroups" >
    <md-list>
      <md-subheader>Catégories</md-subheader>
      <md-list-item v-for="group in groups" :key="group._id" @click="showGroup(group)">
        <md-icon>folder</md-icon>
        <span class="md-list-item-text">{{group.name}}</span>
        <md-button class="md-icon-button md-list-action" @click.stop="removeGroup(group)">
          <md-icon>delete</md-icon>
          <md-tooltip md-delay="300">Supprimer</md-tooltip>
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

    showGroup (group) {

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

</style>