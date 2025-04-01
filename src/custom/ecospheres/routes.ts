import type { RouteMeta } from '@/router'
import { type RouteLocationNormalizedLoaded } from 'vue-router'

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
              '@/custom/ecospheres/components/datasets/EcospheresDatasetSearch.vue'
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
          title: 'Indicateurs',
          cardComponent: async () =>
            await import(
              '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
            ),
          cardClass: 'fr-col fr-col-lg-6 fr-col-md-12',
          filterKey: 'indicators'
        } as RouteMeta,
        component: async () =>
          await import('@/views/datasets/DatasetsListView.vue'),
        props: (route: RouteLocationNormalizedLoaded) => ({
          // this forces the component to be recreated when switching from datasets to indicators
          key: 'indicators',
          query: route.query.q,
          page: route.query.page
        })
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
