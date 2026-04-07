import {
  useGlobalSearchPageRoutes,
  useTopicAdminPagesRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: true,
  enableReadMore: true,
  datasetEditorialization: true
}

export const routes: RouteRecordRaw[] = [
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'bouquets',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'bouquets',
    topicConf
  })
]
