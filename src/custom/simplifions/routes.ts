import {
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false,
  datasetEditorialization: false
}

export const routes: RouteRecordRaw[] = [
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  }),
  useTopicSearchPageRoutes({
    pageKey: 'cas-d-usages',
    metaTitle: "Cas d'usages",
    topicConf,
    cardComponent: async () =>
      await import('./components/SimplifionsCasDusageCard.vue')
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'cas-d-usages',
    topicConf
  }),
  useTopicSearchPageRoutes({
    pageKey: 'solutions',
    metaTitle: 'Solutions',
    topicConf
    // cardComponent: async () => await import('./components/SimplifionsCasDusageCard.vue')
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'solutions',
    topicConf
  })
]
