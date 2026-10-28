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
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  ...useContributorsRoutes()
]
