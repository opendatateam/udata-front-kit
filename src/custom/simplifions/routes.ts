import { useTopicSearchPageRoutes } from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false,
  datasetEditorialization: false
}

export const routes: RouteRecordRaw[] = [
  useTopicSearchPageRoutes({
    pageKey: 'cas-d-usages',
    metaTitle: "Cas d'usages",
    topicConf,
    cardComponent: async () =>
      await import('./components/SimplifionsCasDusageCard.vue'),
    descriptionComponent: async () =>
      await import('./components/SimplifionsCasDusageDescription.vue')
  }),
  useTopicSearchPageRoutes({
    pageKey: 'solutions',
    metaTitle: 'Solutions',
    topicConf
    // cardComponent: async () => await import('./components/SimplifionsCasDusageCard.vue')
  })
]
