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
    children: [
      {
        path: '',
        name: 'indicators',
        meta: {
          title: 'Indicateurs'
        },
        component: async () =>
          await import('./views/indicators/IndicatorsListView.vue'),
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
            granularity: route.query.granularity || null,
            page: route.query.page || null,
            sort: route.query.sort || null,
            ...filterProps
          }
        }
      },
      {
        path: ':iid',
        name: 'indicator_detail',
        component: async () =>
          await import('./views/indicators/IndicatorDetailView.vue')
      }
    ]
  }
]
