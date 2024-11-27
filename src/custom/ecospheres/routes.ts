import { type RouteLocationNormalizedLoaded } from 'vue-router'

export const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    },
    component: async () => await import('./views/HomeView.vue')
  },
  {
    path: '/indicators',
    name: 'indicators',
    meta: {
      title: 'Indicateurs'
    },
    props: (route: RouteLocationNormalizedLoaded) => ({
      query: route.query.q,
      theme: route.query.theme,
      geozone: route.query.geozone,
      page: route.query.page
    }),
    component: async () =>
      await import('./views/indicators/IndicatorsListView.vue')
  }
]
