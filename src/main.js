import "@gouvfr/dsfr/dist/dsfr.min.css"      // Import des styles du DSFR
import "@gouvminint/vue-dsfr/styles"         // Import des styles globaux propre à VueDSFR
import "vue3-toastify/dist/index.css"
import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import VueDsfr from "@gouvminint/vue-dsfr"   // Import (par défaut) de la bibliothèque
import App from "./App.vue"
import router from "./router"

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(VueDsfr)
app.use(pinia)

app.mount("#app")
