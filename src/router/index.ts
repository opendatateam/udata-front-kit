import { capitalize, type Component } from 'vue'
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw
} from 'vue-router'

import config from '@/config'
import type { StaticPageConfig } from '@/model/config'
import { useTopicsConf } from '@/utils/config'
import NotFoundView from '@/views/NotFoundView.vue'
import StaticPageView from '@/views/StaticPageView.vue'

// used by custom site routers
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  filtersComponent?: () => Promise<{ default: Component }>
  cardComponent?: () => Promise<{ default: Component }>
  cardClass?: string
  pageKey?: string
}

const { topicsSlug, topicsName } = useTopicsConf()
const disableRoutes: string[] = config.website.router.disable ?? []

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
  // organizations
  {
    path: '/organizations',
    name: 'organizations_routes',
    children: [
      {
        path: '',
        name: 'organizations',
        meta: {
          title: 'Organisations'
        },
        component: async () =>
          await import('@/views/organizations/OrganizationsListView.vue')
      },
      {
        path: ':oid',
        name: 'organization_detail',
        component: async () =>
          await import('@/views/organizations/OrganizationDetailView.vue')
      }
    ]
  },
  {
    path: `/${topicsSlug}`,
    name: 'topic_routes',
    children: [
      {
        path: '',
        name: topicsSlug,
        meta: {
          title: capitalize(topicsName) + 's'
        },
        component: async () =>
          await import('@/views/bouquets/TopicsListView.vue'),
        props: (route: RouteLocationNormalizedLoaded) => ({
          query: route.query.q || null,
          subtheme: route.query.subtheme || null,
          theme: route.query.theme || null,
          geozone: route.query.geozone || null,
          include_private: route.query.include_private,
          page: route.query.page || null,
          sort: route.query.sort || '-created'
        })
      },
      {
        path: ':bid',
        name: `${topicsSlug}_detail`,
        props: (route: RouteLocationNormalizedLoaded) => ({
          bouquetId: route.params.bid
        }),
        component: async () =>
          await import('@/views/bouquets/TopicDetailView.vue')
      }
    ]
  },
  {
    path: `/admin/${topicsSlug}/add`,
    name: `${topicsSlug}_add`,
    component: async () => await import('@/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: true }
  },
  {
    path: `/admin/${topicsSlug}/edit/:bid`,
    name: `${topicsSlug}_edit`,
    component: async () => await import('@/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: false }
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
].filter((route) => {
  if (route.name === undefined) return true
  return !disableRoutes.includes(route.name)
})

// static pages
const pages = (config.website.router.static_pages ?? []).map(
  (item: StaticPageConfig) => {
    return {
      path: item.route,
      name: item.id,
      component: StaticPageView,
      props: { url: item.url },
      meta: {
        title: item.title
      }
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
  const routes = Array.from(routesMap.values())
  routes.push(...pages)
  // catch all 404 (keep at the end of the list)
  routes.push({
    path: '/:pathMatch(.*)',
    component: NotFoundView
  })
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (to.hash !== '') {
        return {
          el: to.hash
        }
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
