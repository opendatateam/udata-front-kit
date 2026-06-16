import {
  useGlobalSearchPageRoutes,
  useTopicAdminPagesRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: true,
  enableReadMore: true
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: "Le Point d'Accès Unique aux Données d'Accessibilité"
    },
    component: async () => await import('./views/HomeView.vue')
  },
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  {
    path: '/themes',
    name: 'themes',
    meta: {
      title: 'Données par thème',
      pageKey: 'themes'
    },
    component: async () => await import('./views/ThemesView.vue')
  },
  useGlobalSearchPageRoutes({
    pageKey: 'themes',
    topicConf,
    renderRootPage: false
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'themes',
    topicConf
  })
]
