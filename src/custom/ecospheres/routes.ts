import type { RouteMeta } from '@/router'
import { type RouteLocationNormalizedLoaded } from 'vue-router'
import { FILTER_KEYS } from './model/indicator'

export const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    } as RouteMeta,
    component: async () => await import('./views/HomeView.vue')
  },
  {
    path: '/datasets',
    children: [
      {
        path: '',
        name: 'datasets',
        meta: {
          title: 'Données',
          filtersComponent: async () =>
            await import(
              '@/custom/ecospheres/components/datasets/DatasetSearch.vue'
            )
        } as RouteMeta,
        component: async () =>
          await import('@/views/datasets/DatasetsListView.vue'),
        props: (route: RouteLocationNormalizedLoaded) => ({
          query: route.query.q,
          page: route.query.page
        })
      },
      {
        path: ':did',
        name: 'dataset_detail',
        component: async () =>
          await import('@/views/datasets/DatasetDetailView.vue')
      }
    ]
  },
  {
    path: '/indicators',
    children: [
      {
        path: '',
        name: 'indicators',
        meta: {
          title: 'Indicateurs'
        } as RouteMeta,
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
