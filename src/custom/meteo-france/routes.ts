import { useSearchPageRoutes } from '@/router/utils'

export const routes = [
  {
    path: '/form',
    name: 'FormMF',
    meta: {
      title: 'Recherche guidée'
    },
    component: async () => await import('./views/FormMF.vue')
  },
  useSearchPageRoutes({
    pageType: 'dataset',
    pageKey: 'datasets',
    metaTitle: 'Données'
  })
]
