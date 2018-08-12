<template>

<div class="project-groups">
  
  <md-empty-state
    md-label="Aucun groupe"
    :md-description="`Il n'y a encore aucun groupe. Vous pouvez en créer pour regrouper les projets`">
    <md-button class="md-primary md-raised" @click="newGroup">Créer un nouveau groupe</md-button>
  </md-empty-state>
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
    groups () {
      return ProjectGroups.find()
    }
  },
  methods: {

    newGroup () {

    }
  }
};
</script>

<style>
</style>