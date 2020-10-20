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
              :label="$t('Email')"
              name="email"
              autocomplete="email"
              :rules="emailRules"
              :disabled="sending"
            />
            <v-text-field
              id="password"
              v-model="form.password"
              :label="$t('Password')"
              type="password"
              name="password"
              :rules="passwordRules"
              autocomplete="password"
              :disabled="sending"
            />
            <v-text-field
              id="password"
              v-model="form.passwordConfirmation"
              :label="$t('Password (again)')"
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
  data() {
    return {
      form: {
        email: null,
        password: null,
        passwordConfirmation: null
      },
      sending: false,
      valid: false,
      emailRules: [
        (v) => !!v || this.$t("Email is mandatory"),
        (v) => (v && v.length > 1) || this.$t("Invalid email")
      ],
      passwordRules: [
        (v) => !!v || this.$t("Password is mandatory"),
        (v) => (v && v.length > 2) || this.$t("Password is too short")
      ]
    };
  },
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
    },
    register() {
      if (this.form.password !== this.form.passwordConfirmation) {
        this.$notify(this.$t("Passwords do not match"));
        return;
      }

      const userData = {
        createdAt: new Date(),
        password: this.form.password,
        email: this.form.email
      };
      this.sending = true;
      Meteor.call("users.create", userData, (error) => {
        this.sending = false;
        if (error) {
          this.$notifyError(error);
        } else if (Meteor.settings.public.emailVerificationNeeded) {
          this.$router.push({ name: "registration-completed" });
        } else {
          Meteor.loginWithPassword(
            this.form.email,
            this.form.password,
            (err) => {
              this.sending = false;
              if (err) {
                this.$notifyError(err.reason);
              } else {
                this.clearForm();
                this.$notify(this.$t("Welcome to you!"));
                this.$router.push({ name: "dashboard-page" });
              }
            }
          );
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
