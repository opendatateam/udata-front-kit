import '@gouvfr/dsfr/dist/core/core.main.min.css' // Le CSS minimal du DSFR

import '@gouvfr/dsfr/dist/component/component.main.min.css' // Styles de tous les composants du DSFR

import '@gouvfr/dsfr/dist/utility/utility.main.min.css' // Classes utilitaires : les composants de VueDsfr en ont besoin

import '@gouvminint/vue-dsfr/styles' // Les styles propres aux composants de VueDsfr

import '@datagouv/components-next/dist/components.css'

import * as Sentry from '@sentry/vue'
import { createHead } from '@unhead/vue'
import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { createPinia } from 'pinia'
import { createApp, markRaw } from 'vue'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import VueMatomo from 'vue-matomo'
import TextClamp from 'vue3-text-clamp'
import 'vue3-toastify/dist/index.css'

import config from '@/config'

import { datagouv } from '@datagouv/components-next'
import App from './App.vue'
import './assets/main.css'
import type { CustomParams } from './model/api'
import type { SentryConfig } from './model/config'
import routerPromise from './router'
import LocalStorageService from './services/LocalStorageService'
import { useUserStore } from './store/UserStore'
import { isNotFoundError } from './utils/http'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

if (config.sentry?.dsn && import.meta.env.MODE !== 'test') {
  Sentry.init({
    app,
    ...(config.sentry as SentryConfig)
  })
}

routerPromise
  .then((router) => {
    app.use(router)
    app.use(pinia)
    app.use(head)
    app.use(TextClamp)
    app.use(LoadingPlugin)
    app.use(datagouv, {
      name: 'data.gouv.fr',
      baseUrl: config.datagouvfr.base_url,
      apiBase: config.datagouvfr.base_url,
      tabularApiUrl: config.datagouvfr.tabular_api_url,
      tabularAllowRemote: true,
      pmtilesViewerBaseUrl: null,
      datasetQualityGuideUrl:
        'https://guides.data.gouv.fr/guides-open-data/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu/ameliorer-le-score-de-qualite-des-metadonnees',
      textClamp: TextClamp,
      maxJsonPreviewCharSize: 1000000, // Maximum size of JSON to preview in characters (~1MB). JSON preview module is partly collapsed by default so we can have a preview for large files.
      maxPdfPreviewByteSize: 10000000, // Maximum size of PDF to preview in bytes (10 MB)
      maxXmlPreviewCharSize: 100000, // Maximum size of XML to preview in characters (~100KB). XML preview module can NOT be collapsed by default so we should not have a preview for large files.
      metricsApiUrl: 'https://metric-api.data.gouv.fr',
      schemaValidataUrl: 'https://validata.fr',
      // inject authentication for datagouv components that make their own API calls
      onRequest: (param) => {
        const store = useUserStore()
        if (store.$state.isLoggedIn && store.$state.token) {
          param.options.headers.set(
            'Authorization',
            `Bearer ${store.$state.token}`
          )
        }
      }
    })

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

    router.beforeEach((to) => {
      // protect authenticated routes
      const store = useUserStore()
      if (to.meta.requiresAuth === true && !store.$state.isLoggedIn) {
        LocalStorageService.setItem('lastRoute', to.fullPath)
        void router.push({ name: 'login' })
      }
      // set page title where needed
      if (to.meta.title != null) {
        document.title = to.meta.title + ' | ' + config.website.title
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
