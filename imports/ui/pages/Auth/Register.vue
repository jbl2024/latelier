<template>
  <div class="register">
    <div class="centered-container">
      <v-form v-model="valid" v-on:submit.prevent="validateRegister">
        <v-card>
          <v-card-title class="title">Créer un compte</v-card-title>
          <v-card-text>
            <v-text-field
              label="Email"
              name="email"
              id="email"
              autocomplete="email"
              :rules="emailRules"
              v-model="form.email"
              :disabled="sending"
            ></v-text-field>
            <v-text-field
              label="Mot de passe"
              type="password"
              name="password"
              :rules="passwordRules"
              id="password"
              autocomplete="password"
              v-model="form.password"
              :disabled="sending"
            ></v-text-field>
            <v-progress-linear indeterminate v-if="sending"></v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit" :disabled="sending || !valid">Créer un compte</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn flat :to="{ name: 'login'}">Déjà un compte ?</v-btn>
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
    form: {
      email: null,
      password: null
    },
    notify: false,
    notifyText: "",
    sending: false,
    valid: false,
    emailRules: [
      v => !!v || "L'email est obligatoire",
      v => v && v.length > 1 || "L'email est invalide"
    ],
    passwordRules: [
      v => !!v || "Le mot de passe est obligatoire",
      v => v && v.length > 2 || "Le mot de passe est trop court"
    ]
  }),
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
      this.notify = false;
    },
    register() {
      this.sending = true;

      const userData = {
        createdAt: new Date(),
        password: this.form.password,
        email: this.form.email
      };
      Accounts.createUser(userData, err => {
        this.sending = false;
        this.notify = false;
        if (err) {
          this.notifyText = "Erreur " + err.reason;
          this.notify = true;
        } else {
          Meteor.loginWithPassword(this.form.email, this.form.password, err => {
            if (err) {
              this.notifyText = "Erreur " + err.reason;
              this.notify = true;
            } else {
              this.clearForm();
              this.$router.push({ name: "organizations-page" });
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

.md-card {
  text-align: left;
  margin: 0 auto;
}

.md-title {
  text-align: center;
}
</style>

