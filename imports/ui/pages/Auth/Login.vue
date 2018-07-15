<template>
  <div class="login">
    <div class="auth-layout_inner">
      <el-card class="auth-layout_card card">
        <header class="auth-layout_card-header card-header">
          <h2>Login</h2>
        </header>
        <span class="divider"></span>
        <el-form
          :model="loginForm"
          :rules="rules"
           ref="loginForm"
           class="auth-layout_card-content card-content">
          <el-form-item
            prop="email"
            label="Email">
            <el-input
              v-model="loginForm.email"
              v-on:keyup.enter="submitForm('loginForm')"
              auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item
            prop="password"
            label="Password">
            <el-input
              type="password"
              v-model="loginForm.password"
              v-on:keyup.enter="submitForm('loginForm')"
              auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              class="auth-layout_submit full-width"
              size="large"
              type="primary"
              @click="submitForm('loginForm')"
              :loading="isLoading">
              Enter
            </el-button>
          </el-form-item>
          <el-form-item class="item-forgot-password">
            <router-link :to="{ name: 'forgot-password'}">Forgot password?</router-link>
          </el-form-item>
        </el-form>
      </el-card>
      <footer class="auth-layout_footer">
        No account yet?
        <router-link :to="{ name: 'register'}">Register</router-link>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'auth-login',
    data: () => ({
      isLoading: false,
      loginForm: {
        email: '',
        password: ''
      },
      rules: {
        email: [
          { required: true, message: 'Please insert your email!', trigger: 'blur' },
          { type: 'email', message: 'Please insert is valid email!', trigger: 'blur,change' }
        ],
        password: [
          { required: true, message: 'Please insert your password!', trigger: 'blur' },
        ],
      }
    }),
    methods: {
      submitForm(formName) {
        this.isLoading = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const dataForm = this.loginForm
            const email = dataForm.email,
                  password = dataForm.password
            Meteor.loginWithPassword(email, password, (err) => {
  						if (err) {
                this.$notify.error({
                  title: 'Sorry',
                  message: err.reason,
                  offset: 100
                })
                this.isLoading = false
  						} else {
                this.$router.push({ name: 'admin-dashboard' })
                this.$notify.success({
                  title: 'Welcome',
                  message: `Good to see you!`,
                  offset: 100,
                  duration: 9000
                })
  						}
  					})
          } else {
            this.$notify.error({
              title: 'Sorry!!!',
              message: 'All fields are required',
              offset: 100
            })
            this.isLoading = false
          }
        })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      }
    }
  }
</script>
