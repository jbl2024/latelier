<template>
  <div class="home">
    <empty-state description="Bienvenue dans l'atelier" illustration="welcome">
      <v-btn class="primary" round :to="{ name: 'dashboard-page'}">Accéder aux projets
      </v-btn>
    </empty-state>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
.login-widget {
  margin-top: 24px;
}
</style>