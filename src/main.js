import '@gouvfr/dsfr/dist/dsfr.min.css'
import VueDsfr from '@gouvminint/vue-dsfr'
// Import des styles du DSFR
import '@gouvminint/vue-dsfr/styles'
import '@vueform/multiselect/themes/default.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import TextClamp from 'vue3-text-clamp'
// Import des styles globaux propre à VueDSFR
import 'vue3-toastify/dist/index.css'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

// Import (par défaut) de la bibliothèque
import App from './App.vue'
import './assets/main.css'
import * as icons from './icons.js'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(VueDsfr, { icons: Object.values(icons) })
app.use(pinia)

app.use(TextClamp)
app.use(LoadingPlugin)

app.mount('#app')
