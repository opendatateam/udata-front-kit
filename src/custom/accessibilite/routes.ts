import {
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: true,
  enableReadMore: true,
  datasetEditorialization: true
}

export const routes: RouteRecordRaw[] = [
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  }),
  useTopicSearchPageRoutes({
    pageKey: 'bouquets',
    metaTitle: 'Bouquets',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'bouquets',
    topicConf
  })
]
