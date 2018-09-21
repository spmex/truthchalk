<template lang="pug">
  div(v-if='hasNotSignedUp')
    router-link(to='/welcome' tag="i" class="el-icon-arrow-left")
      span Back
    h2 Welcome!
    el-form
      el-form-item
        el-input(
          v-model="username" size="small"
          placeholder="username"
        )
          i(slot="prefix" class="el-input__icon el-icon-edit")
      el-form-item
        el-input(
          v-model="email" size="small"
          placeholder="email@example.com"
        )
          i(slot="prefix" class="el-input__icon el-icon-message")
      el-form-item
        el-input(
          v-model="passwd" size="small"
          placeholder="password" type="password"
        )
          i(slot="prefix" class="el-input__icon el-icon-more")
      el-form-item
        el-input(
          v-model="confirmPasswd" size="small"
          placeholder="confirm password" type="password"
        )
          i(slot="prefix" class="el-input__icon el-icon-more-outline")
      p(v-if="error" class="tc-error") {{ errorMessage }}
      el-form-item.button
        el-button(
          id="signup" @click="signup" type="submit" size="small" round
        ) Signup
  div(v-else)
      
    h2 #[i(id="tick" class="el-icon-circle-check-outline")]
      br
      |
      br
      | You have signed up successfully.
    router-link(to='/dashboard')
      el-button(id="redirect" size="small" round) Go to dashboard
</template>
<script>
  export default {
    data: () => ({
      username: '',
      email: '',
      passwd: '',
      confirmPasswd: '',
      error: false,
      errorMessage: '',
      hasNotSignedUp: true
    }),
    methods: {
      signup () {
        if (this.isInfoValid()) {
          chrome.runtime.getBackgroundPage(async (bg) => {
            let message = await bg.background.default.signUp(
              this.username, this.email, this.passwd
            )
            if (message.success) {
              this.hasNotSignedUp = false
            } else {
              this.error = true
              this.errorMessage = message.message
            }
          })
        }
      },

      isInfoValid () {
        if (this.username.length === 0) {
          this.error = true
          this.errorMessage = 'Your username cannot be empty'
          return false
        }
        if (this.email.length === 0) {
          this.error = true
          this.errorMessage = 'Your email cannot be empty'
          return false
        }
        if (this.passwd.length === 0) {
          this.error = true
          this.errorMessage = 'Password cannot be empty'
          return false
        }
        if (this.passwd !== this.confirmPasswd) {
          this.error = true
          this.errorMessage = 'Password does not match the confirm password'
          return false
        }
        return true
      }
    }
  }
</script>
<style scoped>
h2 {
  text-align: center
}
#tick{
  text-align: center;
  font-size: 55px;
  color: green
}
.el-form-item{
  margin-bottom: 0
}
.el-form-item.button{
  margin-top: 10%;
}
#signup, #redirect{
  position: absolute;
  padding-left: 12px;
  margin-bottom: 6%;
  width: 60%;
  left: 20%;
  background: black;
  color: orange
}
</style>