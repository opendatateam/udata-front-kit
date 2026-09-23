import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import config from '@/config'
import type { StaticPageConfig } from '@/model/config'
import type { TopicPageRouterConf } from '@/router/model'
import {
  useGlobalSearchPageRoutes,
  useTopicAdminPagesRoutes
} from '@/router/utils'
import LocalStorageService from '@/services/LocalStorageService'
import { usePageConf, usePagesConf } from '@/utils/config'
import NotFoundView from '@/views/NotFoundView.vue'
import StaticPageView from '@/views/StaticPageView.vue'
import { toast } from '@datagouv/components-next'

// common/default routes
const defaultRoutes: RouteRecordRaw[] = [
  // home
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    },
    component: async () => await import('@/views/HomeView.vue')
  },
  // in-app config editor, hot-updates the running site (see @/config.ts)
  {
    path: '/editor',
    name: 'config_editor',
    meta: {
      title: 'Éditeur de configuration'
    },
    component: async () => await import('@/views/ConfigEditorView.vue')
  },
  // in-app universe manager: lets a logged-in user pick the datasets that
  // back this site's pages via a data.gouv.fr Topic (see store/UniverseStore.ts)
  {
    path: '/universe',
    name: 'universe_manager',
    meta: {
      title: 'Mon univers'
    },
    component: async () => await import('@/views/UniverseManagerView.vue')
  },
  // technical pages
  {
    path: '/404',
    name: 'not_found',
    meta: {
      title: 'Page introuvable'
    },
    component: NotFoundView
  }
]

// static pages
const pages: RouteRecordRaw[] = (config.website.router.static_pages ?? []).map(
  (item: StaticPageConfig) => {
    return {
      path: item.route,
      name: item.id,
      component: StaticPageView,
      props: { url: item.url }
    }
  }
)

// oauth
if (config.website.oauth_option === true) {
  defaultRoutes.push(
    {
      path: '/login',
      name: 'login',
      // the oauth flow relies on localStorage to persist PKCE state across the redirect
      beforeEnter: () => {
        if (!LocalStorageService.isAvailable()) {
          toast.error(
            'La connexion nécessite que votre navigateur autorise le stockage local.'
          )
          return { name: 'home' }
        }
      },
      component: async () => await import('@/views/LoginView.vue')
    },
    {
      path: '/login/callback',
      name: 'login_callback',
      component: async () => await import('@/views/LoginView.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      component: async () => await import('@/views/LogoutView.vue')
    }
  )
}

// sitemap
if (config.website.sitemap != null) {
  defaultRoutes.push({
    path: '/sitemap',
    name: 'Sitemap',
    meta: {
      title: 'Plan du site'
    },
    component: async () => await import('@/views/SitemapView.vue'),
    props: () => ({
      sitemap: config.website.sitemap
    })
  })
}

// used for topic pages generated below
const DEFAULT_TOPIC_CONF: TopicPageRouterConf = {
  displayMetadata: true,
  enableReadMore: true
}

// mirrors what a hand-written custom/<site>/routes.ts does for a single
// config.pages entry: one search route, plus topic admin routes when the
// page is a topics page. Shared by the initial route generation below and
// by the live-reload watcher further down (new pages added via the in-app
// config editor after boot).
function routesForPage(pageKey: string): RouteRecordRaw[] {
  const pageConf = usePageConf(pageKey)
  if (pageConf.object_type === 'topics') {
    return [
      useGlobalSearchPageRoutes({ pageKey, topicConf: DEFAULT_TOPIC_CONF }),
      ...useTopicAdminPagesRoutes({ pageKey, topicConf: DEFAULT_TOPIC_CONF })
    ]
  }
  return [useGlobalSearchPageRoutes({ pageKey })]
}

function generateRoutesFromConfig(): RouteRecordRaw[] {
  return Object.keys(usePagesConf()).flatMap(routesForPage)
}

// custom routes from site-specific routes definition
async function loadRoutes(): Promise<RouteRecordRaw[]> {
  const importedModule = await import(
    `../custom/${import.meta.env.VITE_SITE_ID}/routes.ts`
  ).catch(() => {
    console.debug(
      'No custom routes.ts for this site, generating routes from config.pages'
    )
    return { routes: generateRoutesFromConfig() }
  })
  return importedModule.routes
}

const siteRoutesPromise = loadRoutes()
// merge routes and give priority to siteRoutes for same path
const routesMap = new Map()
defaultRoutes.forEach((route) => {
  routesMap.set(route.path, route)
})
const routerPromise = siteRoutesPromise.then((siteRoutes) => {
  siteRoutes.forEach((route) => {
    routesMap.set(route.path, route)
  })
  // FIXME: remove me when simplifions is out of front-kit (SEO/sitemap hack)
  // static pages never override an already registered route (default or site-specific)
  pages.forEach((route) => {
    if (!routesMap.has(route.path)) {
      routesMap.set(route.path, route)
    }
  })
  const routes = Array.from(routesMap.values())
  // catch all 404 (keep at the end of the list)
  routes.push({
    path: '/:pathMatch(.*)',
    component: NotFoundView
  })
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
      // Skip auto-scroll for factor hashes - we handle scrolling manually in TopicDetailView
      if (to.hash.startsWith('#factor-')) {
        return false
      }
      if (to.hash !== '') {
        // Only scroll if the element is already in the DOM. If it isn't (async content),
        // useHashScroll in the target component can take over if wired.
        if (document.querySelector(to.hash)) {
          return { el: to.hash }
        }
        return false
      }
      // Preserve scroll when switching between search list pages (e.g. datasets ↔ indicators)
      if (to.meta.searchConfig && from.meta.searchConfig) {
        return false
      }
      if (savedPosition !== null) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
  })

  // config.pages can gain new keys at runtime (in-app config editor, see
  // ConfigEditorView.vue) — vue-router's route table is otherwise only
  // built once, here, at boot, so a brand new page would 404 forever
  // without this. Only reacts to the page-key set changing (Object.keys),
  // not to every edit of an existing page's fields.
  watch(
    () => Object.keys(usePagesConf()),
    (pageKeys) => {
      let addedAny = false
      for (const pageKey of pageKeys) {
        if (router.hasRoute(pageKey)) continue
        routesForPage(pageKey).forEach((route) => router.addRoute(route))
        addedAny = true
      }
      // re-resolve the current URL in case we were sitting on a 404 for
      // the page that just became available
      if (addedAny) {
        void router.replace(router.currentRoute.value.fullPath)
      }
    }
  )

  return router
})

export default routerPromise
