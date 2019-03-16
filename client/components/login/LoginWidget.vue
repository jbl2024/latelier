<template>
  <div class="login-widget">
    <div class="centered-container">
      <v-form v-model="valid" v-on:submit.prevent>
        <v-card>
          <v-card-title class="title">Authentification</v-card-title>
          <v-card-text>
            <v-text-field
              label="Email"
              name="email"
              id="email"
              autocomplete="email"
              type="email"
              v-model="form.email"
              :rules="emailRules"
              :disabled="sending"
            ></v-text-field>
            <v-text-field
              label="Mot de passe"
              type="password"
              name="password"
              id="password"
              autocomplete="password"
              :rules="passwordRules"
              v-model="form.password"
              v-on:keyup.enter="login()"
              :disabled="sending"
            ></v-text-field>
            <v-progress-linear indeterminate v-if="sending"></v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="login" :disabled="sending || !valid">Se connecter</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn flat :to="{ name: 'register'}">Créer un compte</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat :to="{ name: 'forgot-password'}">Mot de passe oublié ?</v-btn>
          </v-card-actions>
          <v-snackbar v-model="notify">{{ notifyText }}</v-snackbar>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login-widget",
  data: () => ({
    valid: false,
    form: {
      email: '',
      password: ''
    },
    notify: false,
    notifyText: "",
    sending: false,
    emailRules: [
      v => !!v || "L'email est obligatoire",
      v => v.length > 1 || "L'email est trop cours"
    ],
    passwordRules: [
      v => !!v || "Le mot de passe est obligatoire",
      v => v.length > 1 || "Le mot de passe est trop cours"
    ]

  }),
  i18n: {
    messages: {
      en: { 
        "Welcome back!": "Welcome back!",
      },
      fr: {
        "Welcome back!": "Ravi de vous revoir!",
      }
    }  
  },
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
      this.notify = false;
    },
    login() {
      this.sending = true;

      Meteor.loginWithPassword(this.form.email, this.form.password, err => {
        this.sending = false;
        this.notify = false;
        if (err) {
          this.notifyText = "Erreur " + err.reason;
          this.notify = true;
        } else {
          this.clearForm();
          this.$store.dispatch("notify", this.$t("Welcome back!"));
          this.$router.push({ name: "dashboard-page" });
        }
      });
    },
    validateLogin() {
      this.login();
    }
  }
};
</script>

<style scoped>
.centered-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: calc(100vh - 64px);
}
</style>
