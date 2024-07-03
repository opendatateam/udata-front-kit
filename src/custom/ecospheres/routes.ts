import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: async () => await import('./views/HomeView.vue')
  },
  {
    path: '/bouquets',
    children: [
      {
        path: '',
        name: 'bouquets',
        component: async () =>
          await import(
            '@/custom/ecospheres/views/bouquets/BouquetsListView.vue'
          ),
        props: (route: RouteLocationNormalizedLoaded) => ({
          query: route.query.q,
          subtheme: route.query.subtheme,
          theme: route.query.theme,
          geozone: route.query.geozone,
          drafts: route.query.drafts
        })
      },
      {
        path: ':bid',
        name: 'bouquet_detail',
        props: (route: RouteLocationNormalizedLoaded) => ({
          bouquetId: route.params.bid
        }),
        component: async () =>
          await import(
            '@/custom/ecospheres/views/bouquets/BouquetDetailView.vue'
          )
      }
    ]
  },
  {
    path: `/admin/bouquets/add`,
    name: 'bouquet_add',
    component: async () =>
      await import('@/custom/ecospheres/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: true }
  },
  {
    path: `/admin/bouquets/edit/:bid`,
    name: 'bouquet_edit',
    component: async () =>
      await import('@/custom/ecospheres/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: false }
  }
]
