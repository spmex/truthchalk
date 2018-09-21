<template lang="pug">
  div
    h2 Your votes
    el-button(id="logout" @click="logOut" size="small" round) Logout
</template>
<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () { },
    mounted () { },
    methods: {
      logOut () {
        chrome.runtime.getBackgroundPage(async (bg) => {
          await bg.background.default.logOut()
          this.$router.push('/welcome')
        })
      }
    }
  }
</script>
<style scoped>
#logout{
  position: absolute;
  margin-top: 5%;
  margin-bottom: 5%;
  left: 32.5%;
  background: orange;
  color: black
}
</style>