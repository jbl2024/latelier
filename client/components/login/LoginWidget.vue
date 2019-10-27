<template>
  <div class="login-widget">
    <div class="centered-container">
      <v-form v-model="valid" @submit.prevent>
        <v-card>
          <v-card-title class="title">
            Authentification
          </v-card-title>
          <v-card-text>
            <v-text-field
              id="email"
              v-model="form.email"
              label="Email"
              name="email"
              autocomplete="email"
              type="email"
              :rules="emailRules"
              :disabled="sending"
            />
            <v-text-field
              id="password"
              v-model="form.password"
              label="Mot de passe"
              type="password"
              name="password"
              autocomplete="password"
              :rules="passwordRules"
              :disabled="sending"
              @keyup.enter="login()"
            />
            <v-progress-linear v-if="sending" indeterminate />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :disabled="sending || !valid" @click="login">
              Se connecter
            </v-btn>
          </v-card-actions>
          <v-divider />
          <v-card-actions>
            <v-btn text :to="{ name: 'register' }">
              Créer un compte
            </v-btn>
            <v-spacer />
            <v-btn text :to="{ name: 'forgot-password' }">
              Mot de passe oublié ?
            </v-btn>
          </v-card-actions>
          <v-snackbar v-model="notify">
            {{ notifyText }}
          </v-snackbar>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginWidget",
  data() {
    return {
      valid: false,
      form: {
        email: "",
        password: ""
      },
      notify: false,
      notifyText: "",
      sending: false,
      emailRules: [
        (v) => !!v || this.$t("Email is mandatory"),
        (v) => v.length > 1 || this.$t("Invalid email")
      ],
      passwordRules: [
        (v) => !!v || this.$t("Password is mandatory"),
        (v) => v.length > 1 || this.$t("Password is too short")
      ]
    };
  },
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
      this.notify = false;
    },
    login() {
      this.sending = true;

      Meteor.loginWithPassword(this.form.email, this.form.password, (err) => {
        this.sending = false;
        this.notify = false;
        if (err) {
          this.notifyText = `Erreur ${err.reason}`;
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
