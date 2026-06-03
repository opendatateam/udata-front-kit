import { useGlobalSearchPageRoutes } from '@/router/utils'
import type { SimplifionsArticleCard, SimplifionsArticleMeta, SimplifionsFolderMeta } from './model/articles'
import { buildSimplifionsArticleCard } from './model/articles'
import { RouterView, type RouteRecordRaw } from 'vue-router'
import { articleMeta as apiFranceConnecteesArticleMeta } from './views/Articles/ApisFranceConnectees/ApisFranceConnectees.vue'
import { themeMeta as apiFranceConnecteesFolderMeta } from './views/Articles/ApisFranceConnectees'
import { articleMeta as guidesDeBaseArticleMeta } from './views/Articles/GuidesBases/GuideBasePetitesCollectivites.vue'
import { themeMeta as guidesDeBaseFolderMeta } from './views/Articles/GuidesBases'
import { themeMeta as guidesMeta } from './views/Articles'
import { articleMeta as nouvelArticleSansDossier } from './views/Articles/NouvelArticleSansDossier.vue'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

const buildArticleFolderRoute = (
  folderMeta: SimplifionsFolderMeta,
  articleMeta: SimplifionsArticleMeta,
  articles: readonly SimplifionsArticleCard[],
  articleComponent: () => Promise<unknown>
): RouteRecordRaw => {
  return {
    path: `/${guidesMeta.id}/${folderMeta.id}`,
    component: RouterView,
    children: [
      {
        path: '',
        name: folderMeta.id,
        meta: {
          title: folderMeta.title
        },
        component: async () =>
          await import('./components/SimplifionsArticleFolderView.vue'),
        props: {
          title: folderMeta.title,
          lead: folderMeta.description,
          heroImageSrc: folderMeta.heroImageSrc,
          heroBackdropGradient: folderMeta.heroBackdropGradient,
          breadcrumbLinks: [
            { to: '/', text: 'Accueil' },
            { to: `/${guidesMeta.id}`, text: guidesMeta.title },
            { text: folderMeta.title }
          ],
          articles
        }
      },
      {
        path: articleMeta.id,
        name: articleMeta.id,
        meta: {
          title: articleMeta.title
        },
        component: articleComponent
      }
    ]
  }
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
    path: '/guides',
    name: guidesMeta.id,
    meta: { title: guidesMeta.title },
    component: async () => await import('./views/GuidesView.vue')
  },
  buildArticleFolderRoute(
    apiFranceConnecteesFolderMeta,
    apiFranceConnecteesArticleMeta,
    [buildSimplifionsArticleCard(apiFranceConnecteesFolderMeta, apiFranceConnecteesArticleMeta, `/${guidesMeta.id}`)],
    async () => await import('./views/Articles/ApisFranceConnectees/ApisFranceConnectees.vue')
  ),
  {
    path: '/apis-franceconnectees',
    redirect: '/guides/api-franceconnectees/les-apis-franceconnectees'
  },
  buildArticleFolderRoute(
    guidesDeBaseFolderMeta,
    guidesDeBaseArticleMeta,
    [buildSimplifionsArticleCard(guidesDeBaseFolderMeta, guidesDeBaseArticleMeta, `/${guidesMeta.id}`)],
    async () => await import('./views/Articles/GuidesBases/GuideBasePetitesCollectivites.vue')
  ),
  {
    path: `/${guidesMeta.id}/${nouvelArticleSansDossier.id}`,
    name: nouvelArticleSansDossier.id,
    meta: { title: nouvelArticleSansDossier.title },
    component: async () => await import('./views/Articles/NouvelArticleSansDossier.vue')
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
