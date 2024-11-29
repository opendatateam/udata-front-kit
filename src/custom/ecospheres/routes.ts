import { type RouteLocationNormalizedLoaded } from 'vue-router'
import { FILTER_KEYS } from './model/indicator'

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
    props: (route: RouteLocationNormalizedLoaded) => {
      const filterProps = FILTER_KEYS.reduce(
        (acc, key) => ({
          ...acc,
          [key]: route.query[key] || null
        }),
        {}
      )
      return {
        query: route.query.q,
        geozone: route.query.geozone || null,
        page: route.query.page || null,
        sort: route.query.sort || null,
        ...filterProps
      }
    },
    component: async () =>
      await import('./views/indicators/IndicatorsListView.vue')
  }
]
