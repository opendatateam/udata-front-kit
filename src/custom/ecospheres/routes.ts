export const routes = [
  {
    path: '/',
    name: 'home',
    component: async () => await import('./views/HomeView.vue')
  },
  {
    path: '/bouquets',
    children: [
      {
        path: '',
        name: 'bouquets',
        component: async () =>
          await import(
            '@/custom/ecospheres/views/bouquets/BouquetsListView.vue'
          )
      },
      {
        path: ':bid',
        name: 'bouquet_detail',
        component: async () =>
          await import(
            '@/custom/ecospheres/views/bouquets/BouquetDetailView.vue'
          )
      }
    ]
  },
  {
    path: `/admin/bouquets/add`,
    name: 'bouquet_add',
    component: async () =>
      await import('@/custom/ecospheres/views/bouquets/BouquetAddView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: `/admin/bouquets/edit/:bid`,
    name: 'bouquet_edit',
    component: async () =>
      await import('@/custom/ecospheres/views/bouquets/BouquetEditView.vue'),
    meta: { requiresAuth: true }
  }
]
