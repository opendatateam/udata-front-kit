import type { RouteMeta } from '@/router'
import { useSearchPageRoutes } from '@/router/utils'

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
    slug: 'datasets',
    metaTitle: 'Données',
    pageKey: 'datasets',
    filtersComponent: async () =>
      await import('./components/datasets/EcospheresDatasetSearch.vue')
  }),
  useSearchPageRoutes({
    slug: 'indicators',
    metaTitle: 'Indicateurs',
    pageKey: 'indicators',
    cardClass: 'fr-col fr-col-lg-6 fr-col-md-12',
    filtersComponent: async () =>
      await import('./components/datasets/EcospheresDatasetSearch.vue'),
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      )
  })
  // {
  //   path: '/bouquets',
  //   children: [
  //     {
  //       path: '',
  //       name: 'bouquets',
  //       meta: {
  //         title: 'Bouquets'
  //       },
  //       component: async () =>
  //         await import('@/views/bouquets/BouquetsListView.vue'),
  //       props: (route: RouteLocationNormalizedLoaded) => ({
  //         query: route.query.q || null,
  //         page: route.query.page || null,
  //         sort: route.query.sort || '-last_modified'
  //       })
  //     },
  //     {
  //       path: ':tid',
  //       name: 'bouquet_detail',
  //       props: (route: RouteLocationNormalizedLoaded) => ({
  //         topicId: route.params.tid
  //       }),
  //       component: async () =>
  //         await import('@/views/bouquets/BouquetDetailView.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/admin/bouquet/add',
  //   name: 'bouquet_add',
  //   component: async () => await import('@/views/bouquets/BouquetFormView.vue'),
  //   meta: { requiresAuth: true },
  //   props: { isCreate: true }
  // },
  // {
  //   path: '/admin/bouquet/edit/:bid',
  //   name: 'bouquet_edit',
  //   component: async () => await import('@/views/bouquets/BouquetFormView.vue'),
  //   meta: { requiresAuth: true },
  //   props: { isCreate: false }
  // },
]
