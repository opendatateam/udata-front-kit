import { setupI18n } from '@etalab/data.gouv.fr-components'
import '@etalab/data.gouv.fr-components/dist/style.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.min.css'
import VueDsfr from '@gouvminint/vue-dsfr'
// Import des styles du DSFR
import '@gouvminint/vue-dsfr/styles'
import '@vueform/multiselect/themes/default.css'
// api and user related stuf
import axios from 'axios'
import { createPinia } from 'pinia'
import { createApp, markRaw } from 'vue'
import TextClamp from 'vue3-text-clamp'
// Import des styles globaux propre à VueDSFR
import 'vue3-toastify/dist/index.css'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import VueMatomo from 'vue-matomo'

import config from '@/config'

// Import (par défaut) de la bibliothèque
import App from './App.vue'
import './assets/main.css'
import * as icons from './icons.js'
import router from './router'
import { useUserStore } from './store/UserStore'

const app = createApp(App)
const pinia = createPinia()
const i18n = setupI18n()

app.use(router)
app.use(VueDsfr, { icons: Object.values(icons) })
app.use(pinia)
app.use(i18n)
if (config.website.matomo.siteId) {
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

app.use(TextClamp)
app.use(LoadingPlugin)

// setup the interceptor for API calls, based on stored infos
// this is done here (upmost possible) to avoid circular deps below

// inject token in requests if user is loggedIn
axios.interceptors.request.use(
  async (config) => {
    const store = useUserStore()
    if (store.$state.isLoggedIn) {
      config.headers.Authorization = `Bearer ${store.$state.token}`
    }
    return config
  },
  async (error) => await Promise.reject(error)
)

// protect authenticated routes
router.beforeEach((to) => {
  const store = useUserStore()
  if (to.meta.requiresAuth && !store.$state.isLoggedIn) {
    localStorage.setItem('lastPath', to.path)
    router.push({ name: 'login' })
  }
})

app.mount('#app')
