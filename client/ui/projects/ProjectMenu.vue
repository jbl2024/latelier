<template>

<div class="project-menu">
  <md-list v-show="$subReady.project">

    <md-list-item :to="{ name: 'project', params: { organizationId: project.organizationId, projectId: project._id }}">
      <md-icon>list</md-icon>
      <span class="md-list-item-text">Tâches</span>
    </md-list-item>

    <md-list-item :to="{ name: 'project-timeline', params: { organizationId: project.organizationId, projectId: project._id }}" v-if="project._id">
      <md-icon>timeline</md-icon>
      <span class="md-list-item-text">Planning</span>
    </md-list-item>

    <md-list-item :to="{ name: 'project-attachments-page', params: { organizationId: project.organizationId, projectId: project._id }}" v-if="project._id">
      <md-icon>attachment</md-icon>
      <span class="md-list-item-text">Pièces jointes</span>
    </md-list-item>

    <md-list-item :to="{ name: 'project-settings', params: { organizationId: project.organizationId, projectId: project._id }}" v-if="project._id">
      <md-icon>settings</md-icon>
      <span class="md-list-item-text">Paramètres</span>
    </md-list-item>

    <md-divider></md-divider>
    
    <labels :projectId="projectId"></labels>
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
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      }
    },
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