<template lang="pug">
  div(id="app")
    router-view
</template>
<script>
export default {
  name: 'app'
}
</script>
<style>
*{
  font-family: 'Bookman Old Style', serif
}
.el-button{
  height: 30px;
  opacity: 0.7;
  border-color: black;
  font-size: 12px
}
.el-button:hover {
  opacity: 1.0;
  border-color: black;
  box-shadow: 0 0 0 black
}
.el-button:focus {
  opacity: 1.0;
  border-color: black;
  box-shadow: 0 0 0 black
}
.tc-error{
  color: red;
  margin-bottom: 0
}
</style>