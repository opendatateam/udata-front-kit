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
    path: '/deps',
    name: 'deps',
    meta: {
      title: 'DEPS'
    },
    component: async () => await import('./views/DepsView.vue')
  },
  {
    path: '/publier',
    name: 'publier',
    meta: {
      title: 'Publier'
    },
    component: async () => await import('./views/PublierView.vue')
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
