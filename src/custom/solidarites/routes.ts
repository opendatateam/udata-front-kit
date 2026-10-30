import {
  useContributorsRoutes,
  useGlobalSearchPageRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  {
    path: '/outils-exploration',
    name: 'outils-exploration',
    meta: {
      title: "Outils d'exploration"
    },
    component: async () => await import('./views/OutilsView.vue')
  },
  {
    path: '/webinaires',
    name: 'webinaires',
    meta: {
      title: 'Webinaires'
    },
    component: async () => await import('./views/WebinairesView.vue')
  },
  {
    path: '/actualites',
    name: 'actualites',
    meta: {
      title: 'Actualites'
    },
    component: async () => await import('./views/NewsView.vue')
  },
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  ...useContributorsRoutes()
]
