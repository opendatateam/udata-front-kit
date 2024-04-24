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
        path: ':bid/datasets/add',
        name: 'bouquet_dataset_add',
        component: async () =>
          await import(
            '@/custom/ecospheres/views/bouquets/BouquetDatasetAddView.vue'
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
      await import('@/custom/ecospheres/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: true }
  },
  {
    path: `/admin/bouquets/edit/:bid`,
    name: 'bouquet_edit',
    component: async () =>
      await import('@/custom/ecospheres/views/bouquets/BouquetFormView.vue'),
    meta: { requiresAuth: true },
    props: { isCreate: false }
  }
]
