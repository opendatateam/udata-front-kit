import config from '@/config'
import BouquetAddView from '@/custom/ecospheres/views/bouquets/BouquetAddView.vue'
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
import TopicsListView from '../views/topics/TopicsListView.vue'

export default class RouterFetch {
  generateRouteItems() {
    const items = []
    config.website.router_items.forEach((item) => {
      if (item.id === 'datasets') {
        items.push({
          path: item.linkPage,
          children: [
            {
              path: '',
              name: item.id,
              component: DatasetsListView
            },
            {
              path: ':did',
              name: 'dataset_detail',
              component: DatasetDetailView
            }
          ]
        })
      } else if (item.id === 'topics') {
        items.push({
          path: item.linkPage,
          children: [
            {
              path: '',
              name: item.id,
              component: TopicsListView
            },
            {
              path: ':did',
              name: 'dataset_detail',
              component: DatasetDetailView
            }
          ]
        })
      } else if (item.id === 'organizations') {
        items.push({
          path: item.linkPage,
          children: [
            {
              path: '',
              name: item.id,
              component: OrganizationsListView
            },
            {
              path: ':oid',
              name: 'organization_detail',
              component: OrganizationDetailView
            }
          ]
        })
      } else if (item.id === 'bouquets') {
        items.push({
          path: item.linkPage,
          children: [
            {
              path: '',
              name: item.id,
              component: BouquetsListView
            },
            {
              path: ':bid',
              name: 'bouquet_detail',
              component: BouquetDetailView
            }
          ]
        })

        /** protected / admin route  **/
        items.push({
          path: `/admin/${item.id}/add`,
          name: 'bouquet_add',
          component: BouquetAddView,
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
          component: () => {
            return item.custom_component
              ? import(`../custom/${item.custom_component}.vue`)
              : Promise.resolve(HomeView)
          }
        })
      } else if (item.type === 'page') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: SimplePageView,
          meta: { title: item.name },
          props: { url: item.url }
        })
      } else if (item.type === 'custom') {
        items.push({
          path: item.linkPage,
          name: item.id,
          component: () => import(`../custom/${item.custom_component}.vue`)
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
