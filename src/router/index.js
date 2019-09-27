import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '省份预览',
      component: () => import('@/components/preview')
    }
  ]
})
