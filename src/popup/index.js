import Vue from 'vue'
import VueRouter from 'vue-router'

import app from './app.vue'
import login from './login.vue'
import signup from './signup.vue'
import welcome from './welcome.vue'
import dashboard from './dashboard.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(ElementUI)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: app
    },
    {
      path: '/welcome',
      component: welcome
    },
    {
      path: '/signup',
      component: signup
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: dashboard
    }
  ]
})

router.beforeEach(function (to, from, next) {
  if (to.path === '/') {
    chrome.runtime.getBackgroundPage((bg) => {
      if (bg.background.default.isLoggedIn()) {
        next({ path: '/dashboard' })
      } else {
        next({ path: '/welcome' })
      }
    })
  } else {
    next()
  }
})

new Vue({ // eslint-disable-line no-new
  router: router,
  render: h => h(app)
}).$mount('#root')
