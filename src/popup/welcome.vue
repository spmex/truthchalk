<template lang="pug">
  div(id='welcome')
    h1(id='title') TruthChalk
    router-link(to="/login")
      el-button(id="login" class="button" size="small" round) Login
    router-link(to="/Signup")
      el-button(id="signup" class="button" size="small" round) Signup
</template>
<script>
export default {
  created () {
    document.body.style.width = '200px'
    document.body.style.height = '200px'
    document.getElementsByTagName('html')[0].style.width = '216px'
    document.getElementsByTagName('html')[0].style.height = '216px'
  }
}
</script>
<style scoped>
#login{
  position: absolute;
  width: 35%;
  left: 12%; 
  bottom: 5%;
  background: orange;
  color: black
}
#signup{
  position: absolute;
  width: 35%;
  right: 12%; 
  bottom: 5%;
  background: black;
  color: orange
}
#title{
  position: absolute;
  top: 35%;
  left: 5%;
  width: 90%;
  text-align: center
}
h1 {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.8);
  z-index: 1
}
h1:before {
  content: "";
  background: orange;
  position: absolute;
  width: 76%;
  left: 12%;
  height: 5px;
  bottom: 0;
  border-radius: 5px;
  transform: scaleX(0);
  animation: 1.4s forwards no-hover-v linear;
  animation-fill-mode: forwards;
  z-index: -1
}
h1:hover:before,
h1:focus:before {
  animation: .5s forwards hover-v linear;
  animation-fill-mode: forwards;
}
@keyframes hover-v {
  0% {
    transform: scaleX(0);
    height: 5px;
  }
  45% {   
    transform: scaleX(1.05);
    height: 5px;
  }
  55% {height: 5px;}
  100% {
    transform: scaleX(1.05);
    height: 1.85rem;
  }
}
@keyframes no-hover-v {
  0% {
    transform: scaleX(1.05);
    height: 1.85rem;
  }
  45% {height: 5px;}
  55% {   
    transform: scaleX(1.05);
    height: 5px;
    opacity: 1;
  }
  100% {
    transform: scaleX(0);
    height: 5px;
    opacity: .02;
  }
}
</style>