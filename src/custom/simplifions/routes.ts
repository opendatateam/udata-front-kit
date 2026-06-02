import { useGlobalSearchPageRoutes } from '@/router/utils'
import { RouterView, type RouteRecordRaw } from 'vue-router'
import {
  articleMeta as apiFranceConnecteesArticleMeta,
  default as apiFranceConnecteesArticleView
} from './views/ApisFranceConnectees/ApisFranceConnectees.vue'
import {
  articleMeta as guidesDeBaseArticleMeta,
  default as guidesDeBaseArticleView
} from './views/GuidesBases/GuideBasePetitesCollectivites.vue'
import { themeMeta as apiFranceConnecteesFolderMeta } from './views/ApisFranceConnectees'
import { themeMeta as guidesDeBaseFolderMeta } from './views/GuidesBases'

const topicConf = {
  displayMetadata: false,
  enableReadMore: false
}

type FolderMeta = {
  id: string
  label: string
  title: string
  description: string
  slug: string
  children: string[]
}

type ArticleMeta = {
  id: string
  title: string
  description: string
  slug: string
}

type ArticleView = () => Promise<unknown>

const buildArticleFolderRoute = (
  folderMeta: FolderMeta,
  articleMeta: ArticleMeta,
  articleComponent: ArticleView
): RouteRecordRaw => {
  return {
    path: folderMeta.slug,
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
          articles: [
            {
              title: articleMeta.title,
              description: articleMeta.description,
              to: `${folderMeta.slug}/${articleMeta.slug}`,
              badge: 'Article'
            }
          ]
        }
      },
      {
        path: articleMeta.slug,
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
  buildArticleFolderRoute(
    apiFranceConnecteesFolderMeta,
    apiFranceConnecteesArticleMeta,
    async () => apiFranceConnecteesArticleView
  ),
  {
    path: '/apis-franceconnectees',
    redirect: '/api-franceconnectees/les-apis-franceconnectees'
  },
  buildArticleFolderRoute(
    guidesDeBaseFolderMeta,
    guidesDeBaseArticleMeta,
    async () => guidesDeBaseArticleView
  ),
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
