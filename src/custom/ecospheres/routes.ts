import {
  useDataserviceSearchPageRoutes,
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
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
      title: 'Accueil'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  useDataserviceSearchPageRoutes({
    pageKey: 'dataservices',
    metaTitle: 'API',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  useDatasetSearchPageRoutes({
    pageKey: 'indicators',
    metaTitle: 'Indicateurs',
    cardClass: 'fr-col fr-col-lg-6 fr-col-md-12',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      ),
    detailsViewComponent: async () =>
      await import(
        '@/custom/ecospheres/views/indicators/IndicatorDetailView.vue'
      )
  }),
  useTopicSearchPageRoutes({
    pageKey: 'bouquets',
    metaTitle: 'Bouquets',
    topicConf,
    datasetCardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'bouquets',
    topicConf
  })
]
