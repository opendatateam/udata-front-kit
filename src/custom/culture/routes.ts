export const routes = [
  {
    path: '/maps',
    name: 'MapCulture',
    component: async () => await import('./views/MapCulture.vue')
  }
]
