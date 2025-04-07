import { useAdminPagesRoutes, useSearchPageRoutes } from '@/router/utils'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Accueil'
    },
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
    cardComponent: async () =>
      await import(
        '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
      )
  }),
  useSearchPageRoutes({
    pageType: 'topic',
    pageKey: 'bouquets',
    metaTitle: 'Bouquets'
  }),
  ...useAdminPagesRoutes('bouquets')
]
