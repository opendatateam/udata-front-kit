import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const routes = [
  {
    path: '/defis',
    children: [
      {
        path: '',
        name: 'bouquets',
        component: async () =>
          await import('@/views/bouquets/BouquetsListView.vue'),
        props: (route: RouteLocationNormalizedLoaded) => ({
          query: route.query.q
        })
      },
      {
        path: ':bid',
        name: 'bouquet_detail',
        props: (route: RouteLocationNormalizedLoaded) => ({
          bouquetId: route.params.bid
        }),
        component: async () =>
          await import('@/views/bouquets/BouquetDetailView.vue')
      }
    ]
  }
]
