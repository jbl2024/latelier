<template>
  <div class="home">
    <empty-state :description="$t('Welcome to l\'atelier')" illustration="welcome">
      <v-btn class="primary" round :to="{ name: 'dashboard-page'}">{{ $t('Go to projects') }}
      </v-btn>
    </empty-state>
  </div>
</template>

<script>
export default {
  i18n: {
    messages: {
      en: {
        "Welcome to l'atelier": "Welcome to l'atelier",
        "Go to projects": "Go to projects",
      },
      fr: {
        "Welcome to l'atelier": "Bienvenue dans l'atelier",
        "Go to projects": "Accéder aux projets",
      }
    }
  },
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