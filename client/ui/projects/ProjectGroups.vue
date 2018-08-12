<template>

<div class="project-groups">
  <new-project-group ref="newProjectGroup"></new-project-group>  
  <div v-if="$subReady.projectGroups">

    <md-content class="list md-elevation-1" v-if="groups.length > 0">
      <md-list>
        <md-list-item v-for="group in groups" :key="group._id" @click="showGroup(group)">
          <span class="md-list-item-text">{{group.name}}</span>
          <md-button class="md-icon-button md-list-action" @click.stop="removeGroup(group)">
            <md-icon>delete</md-icon>
            <md-tooltip md-delay="300">Supprimer</md-tooltip>
          </md-button>

        </md-list-item>
      </md-list>
    </md-content>

    <md-empty-state v-if="groups.length == 0"
      md-label="Aucun groupe"
      :md-description="`Il n'y a encore aucun groupe. Vous pouvez en créer pour regrouper les projets`">
      <md-button class="md-primary md-raised" @click="$refs.newProjectGroup.open()">Créer un nouveau groupe</md-button>
    </md-empty-state>
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
    }
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