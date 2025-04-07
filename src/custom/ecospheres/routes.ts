import {
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
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
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données',
    filtersComponent: async () =>
      await import('./components/datasets/EcospheresDatasetFilters.vue')
  }),
  useDatasetSearchPageRoutes({
    pageKey: 'indicators',
    metaTitle: 'Indicateurs',
    cardClass: 'fr-col fr-col-lg-6 fr-col-md-12',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      )
  }),
  useTopicSearchPageRoutes({
    pageKey: 'bouquets',
    metaTitle: 'Bouquets',
    topicConf: {
      listAll: false,
      displayMetadata: true,
      enableReadMore: true,
      datasetEditorialization: true,
      name: 'bouquet'
    }
  }),
  ...useTopicAdminPagesRoutes('bouquets')
]
