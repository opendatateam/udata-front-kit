import {
  useGlobalSearchPageRoutes,
  useTopicAdminPagesRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: true
}

export const routes: RouteRecordRaw[] = [
  useGlobalSearchPageRoutes({
    pageKey: 'datasets'
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'hackathons',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'hackathons',
    topicConf
  })
]
