<template>
  <div class="reset-password">
    <div class="centered-container">
      <v-form v-model="valid" v-on:submit.prevent>
        <v-card>
          <v-card-title class="title">{{ $t('Reset password') }}</v-card-title>
          <v-card-text>
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
            <v-btn color="primary" @click="reset" :disabled="sending || !valid">{{ $t('Reset') }}</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn flat :to="{ name: 'register'}">{{ $t('Register')}}</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat :to="{ name: 'login'}">{{ $t('Already have an account?') }}</v-btn>
          </v-card-actions>
          <v-snackbar v-model="notify">{{ notifyText }}</v-snackbar>
        </v-card>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "reset-password",
  data: () => ({
    valid: false,
    form: {
      password: ''
    },
    notify: false,
    sending: false,
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
      this.form.password = null;
      this.notify = false;
    },
    reset() {
      this.sending = true;
      const dataForm = this.resetPasswordForm;
      const new_password = this.form.password;
      const token = this.$route.params.token
      Accounts.resetPassword(token, new_password, (err) => {
        if (err) {
          this.$store.dispatch("notify", err.reason);
          this.isLoading = false
        } else {
          this.$store.dispatch("notify", this.$t('Password reset with success!'));
          this.$router.push({name: 'login'})
        }
      })

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
