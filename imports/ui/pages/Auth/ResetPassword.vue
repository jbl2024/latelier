<template>
  <div class="reset-password">
    <div class="centered-container">
      <v-form v-model="valid" @submit.prevent>
        <v-card>
          <v-card-title class="title">
            {{ $t("Reset password") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              id="password"
              v-model="form.password"
              :label="$t('Password')"
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
            <v-btn color="primary" :disabled="sending || !valid" @click="reset">
              {{ $t("Reset") }}
            </v-btn>
          </v-card-actions>
          <v-divider />
          <v-card-actions>
            <v-btn small text :to="{ name: 'register' }">
              {{ $t("Register") }}
            </v-btn>
            <v-spacer />
            <v-btn small text :to="{ name: 'login' }">
              {{ $t("Already have an account?") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResetPassword",
  data: () => ({
    valid: false,
    form: {
      password: ""
    },
    sending: false,
    passwordRules: [
      (v) => !!v || this.$t("Password is mandatory"),
      (v) => v.length > 1 || this.$t("Password is too short")
    ]
  }),
  i18n: {
    messages: {
      en: {
        "Welcome back!": "Welcome back!"
      },
      fr: {
        "Welcome back!": "Ravi de vous revoir!"
      }
    }
  },
  methods: {
    clearForm() {
      this.form.password = null;
    },
    reset() {
      this.sending = true;
      const newPassword = this.form.password;
      const { token } = this.$route.params;
      Accounts.resetPassword(token, newPassword, (err) => {
        if (err) {
          this.$notify(err.reason);
          this.isLoading = false;
        } else {
          this.$notify(this.$t("Password reset with success!"));
          this.$router.push({ name: "login" });
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
