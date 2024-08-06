export const routes = [
  {
    path: '/',
    name: 'home',
    component: async () => await import('./views/HomeView.vue')
  }
]
