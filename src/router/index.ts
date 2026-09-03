import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import config from '@/config'
import type { StaticPageConfig } from '@/model/config'
import { useResourceExplorer } from '@/utils/explorer'
import NotFoundView from '@/views/NotFoundView.vue'
import StaticPageView from '@/views/StaticPageView.vue'

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
  // fullscreen resource explorer, opt-in per site
  {
    path: '/explore/:item_id',
    name: 'explore',
    meta: {
      fullscreen: true,
      preserveScrollOnReplace: true
    },
    component: async () =>
      await import('@/views/datasets/DatasetExploreView.vue'),
    beforeEnter: (to) => {
      const { eligible } = useResourceExplorer()
      if (!eligible.value) {
        return {
          name: 'datasets_detail',
          params: { item_id: to.params.item_id }
        }
      }
    }
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

// custom routes from site-specific routes definition
async function loadRoutes(): Promise<RouteRecordRaw[]> {
  const importedModule = await import(
    `../custom/${import.meta.env.VITE_SITE_ID}/routes.ts`
  ).catch(() => {
    console.info('No custom routes for this site')
    return { routes: [] }
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
  return createRouter({
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
      // When asked explicitely by route, do not scroll to top when navigating on the same page
      if (to.path === from.path && to.meta.preserveScrollOnReplace) {
        return false
      }
      if (savedPosition !== null) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
  })
})

export default routerPromise
