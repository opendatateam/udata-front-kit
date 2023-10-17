import { createRouter, createWebHistory } from "vue-router"
import RouterFetch from "../services/routerUtils"

const routerFetch = new RouterFetch()


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerFetch.generateRouteItems(),
})


export default router
