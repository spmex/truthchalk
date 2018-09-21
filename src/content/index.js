import Vue from 'vue'
import popbar from './popbar.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

const app = document.createElement('div')
document.body.appendChild(app)
app.id = 'tc-popbar'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({ // eslint-disable-line no-new
  el: '#tc-popbar',
  render: h => h(popbar)
})
