import { useGlobalSearchPageRoutes } from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Explorer les données de la justice'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  })
]
