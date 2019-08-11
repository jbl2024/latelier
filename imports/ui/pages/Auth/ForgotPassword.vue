<template>
  <div class="new-password">
    <div class="centered-container">
      <v-form v-model="valid" v-on:submit.prevent="validateRecover">
        <v-card>
          <v-card-title class="title">{{ $t('Recover password') }}</v-card-title>
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
            <v-progress-linear indeterminate v-if="sending"></v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit" :disabled="sending || !valid">{{ $t('Recover') }}</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn text :to="{ name: 'login'}">{{ $t('Already have an account?')}}</v-btn>
            <v-spacer></v-spacer>
            <v-btn text :to="{ name: 'register'}">{{ $t('Register') }}</v-btn>
          </v-card-actions>
          <v-snackbar v-model="notify">{{ notifyText }}</v-snackbar>
        </v-card>
      </v-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "new-password",
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
    ]
  }),
  methods: {
    clearForm() {
      this.form.email = null;
      this.notify = false;
    },
    recover() {
      this.sending = true;
      const email = this.form.email;
      Accounts.forgotPassword({ email }, (err) => {
        this.sending = false;
        if (err) {
          this.$store.dispatch("notify", err.reason);
        } else {
          this.$store.dispatch("notify", this.$t("A link has been sent to your email!"));
          this.$router.push({name: 'login'})
        }
      })
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

