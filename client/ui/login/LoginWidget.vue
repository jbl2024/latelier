<template>
  <div class="login-widget">

    <form novalidate class="md-layout" @submit.prevent="validateLogin">
      <md-card class="md-layout-item md-size-50 md-small-size-100">
        <md-card-header>
          <div class="md-title">Authentification</div>
        </md-card-header>

        <md-card-content>
          <md-field :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input type="email" name="email" id="email" autocomplete="email" v-model="form.email" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.email.required">The email is required</span>
            <span class="md-error" v-else-if="!$v.form.email.email">Invalid email</span>
          </md-field>

          <md-field :class="getValidationClass('password')">
            <label for="password">password</label>
            <md-input type="password" name="password" id="password" v-model="form.password" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.password.required">The password is required</span>
            <span class="md-error" v-else-if="!$v.form.password.minLenght">Invalid email</span>
          </md-field>


        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button type="submit" class="md-primary" :disabled="sending">Suivant</md-button>
        </md-card-actions>
      </md-card>
      <md-snackbar :md-active.sync="notify">{{ notifyText }}</md-snackbar>
    </form>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import {
    required,
    email,
    minLength,
    maxLength
  } from 'vuelidate/lib/validators'

  export default {
    name: 'login-widget',
    mixins: [validationMixin],
      data: () => ({
      form: {
        email: null,
        password: null,
      },
      notify: false,
      notifyText: '',
      sending: false,
    }),
    validations: {
      form: {
        password: {
          required,
          minLength: minLength(3)
        },
        email: {
          required,
          email
        }
      }
    },
    methods: {
      getValidationClass (fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      clearForm () {
        this.$v.$reset()
        this.form.email = null;
        this.form.password = null;
        this.notify = false;
      },
      login () {
        this.sending = true;

        Meteor.loginWithPassword(this.form.email, this.form.password, (err) => {
          this.sending = false;
          this.notify = false;
          if (err) {
            this.notifyText = 'Erreur ' + err.reason;
            this.notify = true;
          } else {
            this.clearForm();
            this.$router.push({ name: 'projects' })
          }
        });
      },
      validateLogin () {
        this.$v.$touch()

        if (!this.$v.$invalid) {
          this.login()
        }
      }
    }
  }
</script>

<style scoped>

.md-card {
  text-align: center;
  margin: 0 auto;
}
</style>
