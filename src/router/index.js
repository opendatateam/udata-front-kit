import { createRouter, createWebHistory } from 'vue-router'

import RouterFetch from '../services/routerUtils'

const routerFetch = new RouterFetch()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerFetch.generateRouteItems(),
  // scroll to top by default, unless back/forward from browser
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
