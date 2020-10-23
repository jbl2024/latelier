<template>
  <div class="new-password">
    <div class="centered-container">
      <v-form v-model="valid" @submit.prevent="validateRecover">
        <v-card>
          <v-card-title class="title">
            {{ $t("Recover password") }}
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
            <v-progress-linear v-if="sending" indeterminate />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" type="submit" :disabled="sending || !valid">
              {{ $t("Recover") }}
            </v-btn>
          </v-card-actions>
          <v-divider />
          <v-card-actions>
            <v-btn small text :to="{ name: 'login' }">
              {{ $t("Already have an account?") }}
            </v-btn>
            <v-spacer />
            <v-btn small text :to="{ name: 'register' }">
              {{ $t("Register") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "NewPassword",
  data() {
    return {
      form: {
        email: null,
        password: null
      },
      sending: false,
      valid: false,
      emailRules: [
        (v) => !!v || this.$t("Email is mandatory"),
        (v) => (v && v.length > 1) || this.$t("Invalid email")
      ]
    };
  },
  methods: {
    clearForm() {
      this.form.email = null;
    },
    recover() {
      this.sending = true;
      const { email } = this.form;
      Accounts.forgotPassword({ email }, (err) => {
        this.sending = false;
        if (err) {
          this.$notifyError(err.reason);
        } else {
          this.$notify(this.$t("Instructions sent, check your inbox!"));
          this.$router.push({ name: "login" });
        }
      });
    },
    validateRecover() {
      this.recover();
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
