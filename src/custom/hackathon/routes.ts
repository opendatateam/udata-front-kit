import {
  useDatasetSearchPageRoutes,
  useTopicAdminPagesRoutes,
  useTopicSearchPageRoutes
} from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: true,
  datasetEditorialization: true
}

export const routes: RouteRecordRaw[] = [
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  }),
  useTopicSearchPageRoutes({
    pageKey: 'hackathons',
    metaTitle: 'Hackathons',
    topicConf
  }),
  ...useTopicAdminPagesRoutes({
    pageKey: 'hackathons',
    topicConf
  })
]
