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
      title: 'Accueil'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  useGlobalSearchPageRoutes({
    pageKey: 'datasets',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'indicators',
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      ),
    detailsViewComponent: async () =>
      await import(
        '@/custom/ecospheres/views/indicators/IndicatorDetailView.vue'
      )
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'dataservices'
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'bouquets',
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
