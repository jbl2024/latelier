<template>
  <div class="registration-completed">
    <empty-state
      :description="$t('Thank you, a confirmation email has been sent to activate your account')"
      illustration="new_message"
    >
      <v-btn class="primary" :to="{ name: 'login' }">
        {{ $t("Back to home") }}
      </v-btn>
    </empty-state>
  </div>
</template>

<script>
export default {
  name: "RegistrationCompleted",
  i18n: {
    messages: {
      en: {
        "Thank you, a confirmation email has been sent to activate your account":
          "Thank you, a confirmation email has been sent to activate your account",
        "Back to home": "Back to home"
      },
      fr: {
        "Thank you, a confirmation email has been sent to activate your account":
          "Merci, un email de confirmation vous permettant d'activer votre compte vient d'être envoyé",
        "Back to home": "Retour à l'accueil"
      }
    }
  }
};
</script>

<style scoped></style>
