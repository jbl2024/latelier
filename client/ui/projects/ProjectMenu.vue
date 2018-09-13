<template>

<div class="project-menu">
      <md-list>
        <md-list-item :to="{ name: 'projects-page'}">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">Accueil</span>
        </md-list-item>

        <md-list-item :to="{ name: 'project-timeline', params: { projectId: project._id }}">
          <md-icon>timeline</md-icon>
          <span class="md-list-item-text">Planning</span>
        </md-list-item>

        <md-list-item :to="{ name: 'project-settings', params: { projectId: project._id }}">
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">Paramètres</span>
        </md-list-item>

        <md-divider></md-divider>
      </md-list>

</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  meteor: {
    project: {
      params () {
        return {
          id: this.projectId
        };
      },
      deep: false,
      update ({id}) {
        return Projects.findOne({ _id: id}) || {};
      }
    }
  },
  data() {
    return {
    };
  },
  methods: {
  }
};
</script>

<style scoped>

</style>