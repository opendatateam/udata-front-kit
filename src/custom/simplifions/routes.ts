import { useGlobalSearchPageRoutes } from '@/router/utils'
import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { articles } from './model/articles'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

const articleComponentLoaders: Record<string, () => Promise<Component>> = {
  'qu-est-ce-qu-une-api': async () =>
    await import('./views/articles/ArticleQuestCeQuUneAPI.vue'),
  'apis-franceconnectees': async () =>
    await import('./views/articles/ArticleApisFranceConnectees.vue'),
  'guide-base-petites-collectivites': async () =>
    await import('./views/articles/ArticleGuideBasePetitesCollectivites.vue'),
  'prerequis-et-etapes-integration-api': async () =>
    await import('./views/articles/ArticlePrerequisEtapesIntegrationAPI.vue'),
  'vos-interlocuteurs-selon-le-type-d-api': async () =>
    await import('./views/articles/ArticleVosInterlocuteursSelonTypeAPI.vue'),
  'anticiper-le-parcours-usager-avant-d-integrer-vos-api': async () =>
    await import('./views/articles/ArticleAnticiperParcoursUsager.vue')
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
    path: '/articles',
    name: 'articles',
    meta: {
      title: 'Articles'
    },
    component: async () => await import('./views/articles/ArticlesListView.vue')
  },
  ...articles.map((meta) => ({
    path: `/articles/${meta.slug}`,
    name: meta.slug,
    meta: {
      title: meta.title
    },
    component: articleComponentLoaders[meta.slug]
  })),
  // Anciennes URLs à plat des articles, conservées pour ne pas casser les liens externes/SEO existants
  ...articles.map((meta) => ({
    path: `/${meta.slug}`,
    redirect: `/articles/${meta.slug}`
  })),
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
