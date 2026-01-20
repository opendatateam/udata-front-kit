import { useTopicSearchPageRoutes } from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
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
  {
    path: '/apis-franceconnectees',
    name: 'apis-franceconnectees',
    meta: {
      title: 'APIs FranceConnectées'
    },
    component: async () => await import('./views/ApisFranceConnectees.vue')
  },
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
    topicConf,
    cardComponent: async () =>
      await import('./components/SimplifionsSolutionCard.vue'),
    descriptionComponent: async () =>
      await import('./components/SimplifionsSolutionDescription.vue')
  })
]
