<template>
  <div class="admin">

    <md-tabs>
      <md-tab id="tab-users" md-label="Utilisateurs" to="">
        Utilisateurs
      </md-tab>

    </md-tabs>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';

export default {
  data () {
    return {
    }
  },
  methods: {
  },
}
</script>

<style scoped>

.admin {
  min-height: 100vh;
  background-color: white;
}
</style>