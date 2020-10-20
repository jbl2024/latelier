<template>
  <div class="register">
    <div class="centered-container">
      <v-form v-model="valid" @submit.prevent="validateRegister">
        <v-card>
          <v-card-title class="title">
            Créer un compte
          </v-card-title>
          <v-card-text>
            <v-text-field
              id="email"
              v-model="form.email"
              label="Email"
              name="email"
              autocomplete="email"
              :rules="emailRules"
              :disabled="sending"
            />
            <v-text-field
              id="password"
              v-model="form.password"
              label="Mot de passe"
              type="password"
              name="password"
              :rules="passwordRules"
              autocomplete="password"
              :disabled="sending"
            />
            <v-progress-linear v-if="sending" indeterminate />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" type="submit" :disabled="sending || !valid">
              Créer un compte
            </v-btn>
          </v-card-actions>
          <v-divider />
          <v-card-actions>
            <v-btn text :to="{ name: 'login' }">
              Déjà un compte ?
            </v-btn>
            <v-spacer />
            <v-btn text :to="{ name: 'forgot-password' }">
              Mot de passe oublié ?
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "LoginWidget",
  data: () => ({
    form: {
      email: null,
      password: null
    },
    sending: false,
    valid: false,
    emailRules: [
      (v) => !!v || "L'email est obligatoire",
      (v) => (v && v.length > 1) || "L'email est invalide"
    ],
    passwordRules: [
      (v) => !!v || "Le mot de passe est obligatoire",
      (v) => (v && v.length > 2) || "Le mot de passe est trop court"
    ]
  }),
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
    },
    register() {
      this.sending = true;

      const userData = {
        createdAt: new Date(),
        password: this.form.password,
        email: this.form.email
      };
      Meteor.call("users.create", userData, (error) => {
        this.sending = false;
        if (error) {
          this.$notifyError(error);
        } else if (Meteor.settings.public.emailVerificationNeeded) {
          this.$router.push({ name: "registration-completed" });
        } else {
          Meteor.loginWithPassword(this.form.email, this.form.password, (err) => {
            this.sending = false;
            if (err) {
              this.$notifyError(err.reason);
            } else {
              this.clearForm();
              this.$notify(this.$t("Welcome to you!"));
              this.$router.push({ name: "dashboard-page" });
            }
          });
        }
      });
    },
    validateRegister() {
      this.register();
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
