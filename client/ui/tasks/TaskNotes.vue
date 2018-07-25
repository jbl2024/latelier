<template>

<div class="task-notes">
  <md-empty-state
    md-icon="note"
    md-label="Aucune note"
    md-description="Vous pouvez ajouter des notes.">
    <md-button class="md-primary md-raised">Créer une note</md-button>
  </md-empty-state>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'


export default {
  props: {
    task: {
      type: Object
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

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}
</style>