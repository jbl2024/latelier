<template>
  <div class="home">
      <empty-state description="Bienvenue sur l'atelier" illustration="organizing">
        <v-btn class="primary" :to="{ name: 'organizations-page'}">Démarrer</v-btn>
      </empty-state>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped>

.login-widget {
  margin-top: 24px;
}

</style>