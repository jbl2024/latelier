<template>
  <div class="new-password">
    <div class="auth-layout_inner">
      <el-card class="auth-layout_card card">
        <header class="auth-layout_card-header card-header">
          <h2>Forgot password</h2>
        </header>
        <span class="divider"></span>
        <el-form
          :model="forgotPasswordForm"
          :rules="rules"
           ref="forgotPasswordForm"
           class="auth-layout_card-content card-content">
          <el-form-item
            prop="email"
            label="Email">
            <el-input
              v-model="forgotPasswordForm.email"
              auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              class="auth-layout_submit full-width"
              size="large"
              type="primary"
              @click.prevent="submitForm('forgotPasswordForm')"
              :loading="isLoading">
              Send
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <footer class="auth-layout_footer">
        <router-link :to="{ name: 'login'}">Back</router-link>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'auth-forgot-password',
    data: () => ({
      isLoading: false,
      forgotPasswordForm: {
        email: ''
      },
      rules: {
        email: [
          { required: true, message: 'Please insert your email!', trigger: 'blur' },
          { type: 'email', message: 'Please insert is valid email!', trigger: 'blur,change' }
        ]
      }
    }),
    methods: {
      submitForm(formName) {
        this.isLoading = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let dataForm = this.forgotPasswordForm
            let email = dataForm.email
            Accounts.forgotPassword({ email }, (err) => {
              if (err) {
                this.$notify.error({
                  title: 'Sorry!',
                  message: err.reason,
                  offset: 100
                })
                this.isLoading = false
              } else {
                this.$notify.success({
                  title: 'Success',
                  message: 'A link has been sent to your email!',
                  offset: 100
                })
                this.$router.push({name: 'login'})
              }
            })
          } else {
            this.$notify.error({
              title: 'Sorry!',
              message: 'Email field is required',
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
