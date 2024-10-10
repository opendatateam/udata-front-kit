export const routes = [
  {
    path: '/form',
    name: 'FormMF',
    meta: {
      title: 'Recherche guidée'
    },
    component: async () => await import('./views/FormMF.vue')
  }
]
