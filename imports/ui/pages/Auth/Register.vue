<template>
  <div class="register">
    <div class="centered-container">
    <form novalidate class="md-layout" @submit.prevent="validateRegister">
      <md-card>
        <md-card-header>
          <div class="md-title">Créer un compte</div>
        </md-card-header>

        <md-card-content>
          <label for="email" class="label">Email</label>
          <md-field :class="getValidationClass('email')">
            <md-input type="email" name="email" id="email" autocomplete="email" v-model="form.email" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.email.required">The email is required</span>
            <span class="md-error" v-else-if="!$v.form.email.email">Invalid email</span>
          </md-field>

          <label for="password" class="label">Mot de passe</label>
          <md-field :class="getValidationClass('password')">
            <md-input type="password" name="password" id="password" autocomplete="password" v-model="form.password" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.password.required">The password is required</span>
            <span class="md-error" v-else-if="!$v.form.password.minLenght">Invalid email</span>
          </md-field>

        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button type="submit" class="md-primary" :disabled="sending">Créer un compte</md-button>
        </md-card-actions>
        <md-card-actions>
          <md-button :to="{ name: 'login'}">Déjà un compte ?</md-button>
          <md-button :to="{ name: 'forgot-password'}">Mot de passe oublié ?</md-button>
        </md-card-actions>
      </md-card>

      <md-snackbar :md-active.sync="notify">{{ notifyText }}</md-snackbar>
    </form>
    </div>
  </div>
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
    mounted () {
      this.$store.dispatch('setHideDrawer', true);    
    },
    beforeDestroy () {
      this.$store.dispatch('setHideDrawer', false);    
    },
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
      register () {
        this.sending = true;

        const userData = {
          createdAt: new Date(),
          password: this.form.password,
          email: this.form.email
        }
        Accounts.createUser(userData, (err) => {
          this.sending = false;
          this.notify = false;
          if(err){
            this.notifyText = 'Erreur ' + err.reason;
            this.notify = true;
          } else {
            Meteor.loginWithPassword(this.form.email, this.form.password, (err) => {
              if (err) {
                this.notifyText = 'Erreur ' + err.reason;
                this.notify = true;
              } else {
                this.clearForm();
                this.$router.push({ name: 'projects-page' })
              }
            });
          }          
        });
      },
      validateRegister () {
        this.$v.$touch()
        if (!this.$v.$invalid) {
          this.register()
        }
      }
    }
  }
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

