import { useGlobalSearchPageRoutes } from '@/router/utils'
import type { SimplifionsArticleCard, SimplifionsArticleMeta, SimplifionsFolderMeta } from './model/articles'
import { buildSimplifionsArticleCard } from './model/articles'
import { RouterView, type RouteRecordRaw } from 'vue-router'
import { articleMeta as apiFranceConnecteesArticleMeta } from './views/Articles/ApisFranceConnectees/ArticleApisFranceConnectees.vue'
import { themeMeta as apiFranceConnecteesFolderMeta } from './views/Articles/ApisFranceConnectees'
import { articleMeta as guidesDeBaseArticleMeta } from './views/Articles/GuidesBases/ArticleGuideBasePetitesCollectivites.vue'
import { articleMeta as guidesDeBaseAPIArticleMeta } from './views/Articles/GuidesBases/ArticleGuideBaseQuestCeQuUneAPI.vue'
import { themeMeta as guidesDeBaseFolderMeta } from './views/Articles/GuidesBases'
import { themeMeta as guidesMeta } from './views/Articles'
import { articleMeta as ditesLeNousUneFois } from './views/Articles/ArticleChronologieJuridiqueDLNUF.vue'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

const buildArticleFolderRoute = (
  folderMeta: SimplifionsFolderMeta,
  articles: readonly SimplifionsArticleCard[],
  articleRoutes: { meta: SimplifionsArticleMeta, component: () => Promise<unknown> }[]
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
      ...articleRoutes.map(({ meta, component }) => ({
        path: meta.id,
        name: meta.id,
        meta: { title: meta.title ?? meta.h1 },
        component
      }))
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
    [buildSimplifionsArticleCard(apiFranceConnecteesFolderMeta, apiFranceConnecteesArticleMeta, `/${guidesMeta.id}`)],
    [{ meta: apiFranceConnecteesArticleMeta, component: async () => await import('./views/Articles/ApisFranceConnectees/ArticleApisFranceConnectees.vue') }]
  ),
  {
    path: '/apis-franceconnectees',
    redirect: '/guides/api-franceconnectees/les-apis-franceconnectees'
  },
  buildArticleFolderRoute(
    guidesDeBaseFolderMeta,
    [
      buildSimplifionsArticleCard(guidesDeBaseFolderMeta, guidesDeBaseArticleMeta, `/${guidesMeta.id}`),
      buildSimplifionsArticleCard(guidesDeBaseFolderMeta, guidesDeBaseAPIArticleMeta, `/${guidesMeta.id}`)
    ],
    [
      { meta: guidesDeBaseArticleMeta, component: async () => await import('./views/Articles/GuidesBases/ArticleGuideBasePetitesCollectivites.vue') },
      { meta: guidesDeBaseAPIArticleMeta, component: async () => await import('./views/Articles/GuidesBases/ArticleGuideBaseQuestCeQuUneAPI.vue') }
    ]
  ),
  {
    path: `/${guidesMeta.id}/${ditesLeNousUneFois.id}`,
    name: ditesLeNousUneFois.id,
    meta: { title: ditesLeNousUneFois.title ?? ditesLeNousUneFois.h1 },
    component: async () => await import('./views/Articles/ArticleChronologieJuridiqueDLNUF.vue')
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
