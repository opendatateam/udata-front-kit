import { useDatasetSearchPageRoutes } from '@/router/utils'
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
    path: '/demarche',
    name: 'demarche',
    meta: {
      title: 'Démarche'
    },
    component: async () => await import('./views/DemarcheView.vue')
  },
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  })
]
