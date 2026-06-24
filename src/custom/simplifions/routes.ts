import { useGlobalSearchPageRoutes } from '@/router/utils'
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
    component: async () =>
      await import(
        './views/articles/apis-france-connectees/ArticleApisFranceConnectees.vue'
      )
  },
  {
    path: '/guide-base-petites-collectivites',
    name: 'guide-base-petites-collectivites',
    meta: {
      title: 'Guide de base pour les petites collectivités'
    },
    component: async () =>
      await import(
        './views/articles/guides-bases/ArticleGuideBasePetitesCollectivites.vue'
      )
  },
  useGlobalSearchPageRoutes({
    pageKey: 'cas-d-usages',
    topicConf,
    cardComponent: async () =>
      await import('./components/SimplifionsCasDusageCard.vue'),
    descriptionComponent: async () =>
      await import('./components/SimplifionsCasDusageDescription.vue')
  }),
  useGlobalSearchPageRoutes({
    pageKey: 'solutions',
    topicConf,
    cardComponent: async () =>
      await import('./components/SimplifionsSolutionCard.vue'),
    descriptionComponent: async () =>
      await import('./components/SimplifionsSolutionDescription.vue')
  })
]
