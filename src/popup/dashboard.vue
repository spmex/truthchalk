<template lang="pug">
  div#dashboard
    div#dashboard-logout(@click="logOut")
      i.el-icon-arrow-left
      b  LogOut
    el-button#refresh(
      type="primary" icon="el-icon-refresh"
      @click="fetchAllAnnotations" circle
    )
    el-card.card(
      v-for="annotation in annotations", :key="annotation.id",
      :style="{ background: getBgColor(annotation) }"
      :body-style="{ padding: '15px' }"
      shadow="hover",      
    )
      blockquote.cardText {{ annotation.text }}
      true-false-buttons(
        v-bind="{ annotation: annotation }"
      )
      el-button.toLink(
        type="primary" icon="el-icon-arrow-right"
        @click="openSourceLink(annotation.source)" circle
      )
</template>
<script>
  import TrueFalseButtons from './trueFalseButtons.vue'

  export default {
    data: () => ({
      annotations: []
    }),
    computed: { },
    components: { TrueFalseButtons },
    created () {
      document.body.style.width = '350px'
      document.getElementsByTagName('html')[0].style.width = '350px'
      if (this.annotations.length === 0) this.fetchAllAnnotations()
    },
    methods: {
      logOut () {
        chrome.runtime.getBackgroundPage(async (bg) => {
          await bg.background.default.logOut()
          this.$router.push('/welcome')
        })
      },

      /*
        Fetch all the annotations from the current user
       */
      fetchAllAnnotations () {
        chrome.runtime.sendMessage(
          { action: 'queryAllAnnotationsByUser' },
          (response) => {
            this.annotations = response.annotations
          }
        )
      },

      /*
        Get color based on the number of True/False
       */
      getBgColor (annotation) {
        return annotation.numTrue >= annotation.numFalse
          ? 'rgba(235, 196, 124, 0.5)'
          : 'rgba(128, 128, 128, 0.5)'
      },

      /*
        Open the URL in a new tab
       */
      openSourceLink (url) {
        chrome.tabs.create({ url: url })
      }
    }
  }
</script>
<style scoped>
#dashboard-logout{
  margin-top: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  color: rgba(74, 150, 250, 0.8);
}
#dashboard-logout:hover{
  color: rgba(74, 150, 250, 1.0);
}
#refresh{
  position: absolute;
  width: 25px;
  height: 25px;
  top: 5px;
  right: 10px;
  padding: 0;
  background-color: rgb(238, 155, 0);
  border-width: 0;
}
.card{
  position: relative;
  margin-bottom: 10px;
}
.card:hover .toLink{
  display:block;
  cursor:pointer;
}
.toLink{
  position: absolute;
  width: 25px;
  height: 25px;
  bottom: 10px;
  right: 5px;
  padding: 0;
  border-width: 0;
  background: gray;
  display: None;
}
.toLink:hover{
  background: rgba(74, 150, 250, 1.0);
}
blockquote {
  font-family: "Trebuchet MS", Helvetica, sans-serif;
  font-size: 14px;
  font-style: italic;
  margin: 1em 0;
  padding-top: 0.2em;
  padding-bottom: 0.8em;
  padding-left: 40px;
  padding-right: 20px;
  line-height: 1.45;
  position: relative;
  color: #383838;
}
blockquote:before {
  display: block;
  padding-left: 10px;
  content: "\201C";
  font-size: 80px;
  position: absolute;
  left: -20px;
  top: -20px;
  color: #7a7a7a;
}
</style>