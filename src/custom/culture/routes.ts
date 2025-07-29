import { useDatasetSearchPageRoutes } from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false,
  datasetEditorialization: false
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  })
]
