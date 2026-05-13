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
    pageKey: 'dataservices',
    datasetCardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'bouquets',
    topicConf,
    datasetCardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/datasets/DatasetOrIndicatorCard.vue'
      )
  }),
  {
    path: '/admin/bouquets/drafts',
    name: 'bouquets_drafts',
    component: async () => await import('@/views/topics/TopicDraftsView.vue'),
    meta: { requiresAuth: true, title: 'Mes brouillons', pageKey: 'bouquets' }
  },
  ...useTopicAdminPagesRoutes({
    pageKey: 'bouquets',
    topicConf
  })
]
