import {
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

export const routes: RouteRecordRaw[] = [
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  }),
  useTopicSearchPageRoutes({
    pageKey: 'defis',
    metaTitle: 'Défis',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'defis',
    topicConf
  })
]
