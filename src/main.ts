import { setupI18n } from '@datagouv/components'
import '@datagouv/components/dist/style.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.min.css'
import VueDsfr from '@gouvminint/vue-dsfr'
import '@gouvminint/vue-dsfr/styles'
import { createHead } from '@unhead/vue'
import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { createPinia } from 'pinia'
import { createApp, markRaw } from 'vue'
import TextClamp from 'vue3-text-clamp'
import 'vue3-toastify/dist/index.css'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import VueMatomo from 'vue-matomo'

import config from '@/config'

import App from './App.vue'
import './assets/main.css'
import * as icons from './icons.js'
import type { CustomParams } from './model/api'
import routerPromise from './router'
import LocalStorageService from './services/LocalStorageService'
import { useUserStore } from './store/UserStore'
import { isNotFoundError } from './utils/http'

const app = createApp(App)
const pinia = createPinia()
const i18n = setupI18n()
const head = createHead()

routerPromise
  .then((router) => {
    app.use(router)
    app.use(VueDsfr, { icons: Object.values(icons) })
    app.use(pinia)
    app.use(i18n)
    app.use(head)
    app.use(TextClamp)
    app.use(LoadingPlugin)

    if (config.website.matomo.siteId != null) {
      app.use(VueMatomo, {
        host: config.website.matomo.host,
        siteId: config.website.matomo.siteId,
        router,
        debug: import.meta.env.DEV
      })
    }

    // Add router to Pinia as a plugin
    pinia.use(({ store }) => {
      store.$router = markRaw(router)
    })

    // protect authenticated routes
    router.beforeEach((to) => {
      const store = useUserStore()
      if (to.meta.requiresAuth === true && !store.$state.isLoggedIn) {
        LocalStorageService.setItem('lastRoute', to)
        void router.push({ name: 'login' })
      }
    })

    // redirect to 404 if configured for this request
    axios.interceptors.response.use(
      async (response) => {
        return response
      },
      async (error) => {
        if (isNotFoundError(error) && error.config.redirectNotFound === true) {
          await router.push({ name: 'not_found' })
        }
        return await Promise.reject(error)
      }
    )

    app.mount('#app')
  })
  .catch((error) => {
    console.error('Failure while loading router config', error)
  })

// setup the interceptor for API calls, based on stored infos
// this is done here (upmost possible) to avoid circular deps below

// inject token in requests if user is loggedIn
axios.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig & CustomParams) => {
    const store = useUserStore()
    if (store.$state.isLoggedIn && requestConfig.authenticated === true) {
      requestConfig.headers.Authorization = `Bearer ${store.$state.token}`
    }
    return requestConfig
  },
  async (error) => await Promise.reject(error)
)
