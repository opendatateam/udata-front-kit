import { useDatasetSearchPageRoutes } from '@/router/utils'

export const routes = [
  {
    path: '/form',
    name: 'FormMF',
    meta: {
      title: 'Recherche guidée'
    },
    component: async () => await import('./views/FormMF.vue')
  },
  useDatasetSearchPageRoutes({
    pageKey: 'datasets',
    metaTitle: 'Données'
  })
]
