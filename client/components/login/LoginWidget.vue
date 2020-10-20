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
        </v-card>
        <template v-if="oauth2Enabled">
          <v-card class="mt-4">
            <v-btn block color="primary" @click="loginOauth2()">
              {{ oauth2Title }}
            </v-btn>
          </v-card>
        </template>
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
      oauth2Enabled: false,
      oauth2Title: "OAuth2",
      form: {
        email: "",
        password: ""
      },
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
  mounted () {
    Meteor.call("users.oauthEnabled", (error, { enabled, title }) => {
      if (error) {
        this.$notifyError(error);
        return;
      }
      this.oauth2Enabled = enabled;
      this.oauth2Title = title;
    });
  },
  methods: {
    clearForm() {
      this.form.email = null;
      this.form.password = null;
    },
    login() {
      this.sending = true;

      Meteor.loginWithPassword(this.form.email, this.form.password, (err) => {
        this.sending = false;
        if (err) {
          this.$notifyError(err.reason);
        } else {
          this.clearForm();
          Meteor.call("permissions.setAdminIfNeeded");
          this.$notify(this.$t("Welcome back!"));
          this.$router.push({ name: "dashboard-page" });
        }
      });
    },
    validateLogin() {
      this.login();
    },

    loginOauth2() {
      Meteor.loginWithOidc({ loginStyle: "popup" }, () => {
        const user = Meteor.user();
        if (user) {
          this.$router.push({ name: "dashboard-page" });
        }
      });
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
