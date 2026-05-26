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
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'themes',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'themes',
    topicConf
  })
]
