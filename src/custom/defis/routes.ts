import {
  useGlobalSearchPageRoutes,
  useTopicAdminPagesRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

export const routes: RouteRecordRaw[] = [
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'defis',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'defis',
    topicConf
  })
]
