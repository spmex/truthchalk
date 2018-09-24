<template lang="pug">
  div
    router-link(to='/welcome' tag="i" class="el-icon-arrow-left")
      span Back
    h2 TruthChalk
    el-form
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
      p(v-if="error" class="tc-error") {{ errorMessage }}
      el-form-item.button
        el-button(
          id="login" @click='logIn' type="submit" size="small" round
        ) login
</template>
<script>
  export default {
    data: () => ({
      email: '',
      passwd: '',
      error: false,
      errorMessage: ''
    }),
    methods: {
      logIn () {
        chrome.runtime.getBackgroundPage(async (bg) => {
          let message = await bg.background.default.logIn(
            this.email, this.passwd
          )
          if (message.success) {
            this.error = false
            this.$router.push('/dashboard')
          } else {
            this.error = true
            this.errorMessage = message.message
          }
        })
      }
    }
  }
</script>
<style scoped>
h2 {
  text-align: center
}
.el-form-item{
  margin-bottom: 0
}
#login{
  position: absolute;
  width: 35%;
  margin-top: 5%;
  margin-bottom: 5%;
  left: 32.5%;
  background: orange;
  color: black
}
</style>