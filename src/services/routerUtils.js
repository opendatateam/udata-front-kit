import config from '@/config'
import BouquetDetailView from '@/custom/ecospheres/views/bouquets/BouquetDetailView.vue'
import BouquetEditView from '@/custom/ecospheres/views/bouquets/BouquetEditView.vue'
import BouquetsListView from '@/custom/ecospheres/views/bouquets/BouquetsListView.vue'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import LogoutView from '../views/LogoutView.vue'
import SimplePageView from '../views/SimplePageView.vue'
import DatasetDetailView from '../views/datasets/DatasetDetailView.vue'
import DatasetsListView from '../views/datasets/DatasetsListView.vue'
import OrganizationDetailView from '../views/organizations/OrganizationDetailView.vue'
import OrganizationsListView from '../views/organizations/OrganizationsListView.vue'

export default class RouterFetch {
  generateRouteItems() {
    const items = []
    config.website.menu_items.forEach((item) => {
      if (item.id === 'datasets') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: DatasetsListView
        })
        items.push({
          path: `${item.linkPage}/:did`,
          name: 'dataset_detail',
          component: DatasetDetailView
        })
      } else if (item.id === 'organizations') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: OrganizationsListView
        })
        items.push({
          path: `${item.linkPage}/:oid`,
          name: 'organization_detail',
          component: OrganizationDetailView
        })
      } else if (item.id === 'bouquets') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: BouquetsListView,
          props: (route) => ({
            initThemeName: route.query.theme,
            initSubthemeName: route.query.subtheme
          })
        })
        items.push({
          path: `${item.linkPage}/:bid`,
          name: 'bouquet_detail',
          component: BouquetDetailView
        })

        /** protected / admin route  **/
        items.push({
          path: `/admin/${item.id}/add`,
          name: 'bouquet_add',
          component: BouquetEditView,
          meta: { requiresAuth: true }
        })
        /** protected / admin route  **/
        items.push({
          path: `/admin/${item.id}/edit/:bid`,
          name: 'bouquet_edit',
          component: BouquetEditView,
          meta: { requiresAuth: true }
        })
      } else if (item.id === 'home') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: HomeView
        })
      } else if (item.type === 'page') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: SimplePageView,
          meta: { title: item.name },
          props: { url: item.url }
        })
      } else if (item.type == 'custom') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: () => import(item.path /* @vite-ignore */)
        })
      }
    })

    if (config.website.oauth_option) {
      items.push({
        path: '/login',
        name: 'login',
        component: LoginView
      })
      items.push({
        path: '/login/callback',
        name: 'login_callback',
        component: LoginView
      })
      items.push({
        path: '/logout',
        name: 'logout',
        component: LogoutView
      })
    }
    return items
  }
}
