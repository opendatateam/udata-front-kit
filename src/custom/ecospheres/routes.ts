import type { RouteMeta } from '@/router/utils'
import { useAdminPagesRoutes, useSearchPageRoutes } from '@/router/utils'

export const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    } as RouteMeta,
    component: async () => await import('./views/HomeView.vue')
  },
  useSearchPageRoutes({
    pageType: 'dataset',
    pageKey: 'datasets',
    metaTitle: 'Données',
    filtersComponent: async () =>
      await import('./components/datasets/EcospheresDatasetSearch.vue')
  }),
  useSearchPageRoutes({
    pageType: 'dataset',
    pageKey: 'indicators',
    metaTitle: 'Indicateurs',
    cardClass: 'fr-col fr-col-lg-6 fr-col-md-12',
    filtersComponent: async () =>
      await import('./components/datasets/EcospheresDatasetSearch.vue'),
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      )
  }),
  useSearchPageRoutes({
    pageType: 'topic',
    pageKey: 'bouquets',
    metaTitle: 'Bouquets'
    // props: (route: RouteLocationNormalizedLoaded) => ({
    // FIXME: handle default sort
    //   sort: route.query.sort || '-created'
    // })
  }),
  ...useAdminPagesRoutes('bouquets')
]
