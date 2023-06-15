import "@gouvfr/dsfr/dist/dsfr.min.css"      // Import des styles du DSFR
import "@gouvminint/vue-dsfr/styles"         // Import des styles globaux propre à VueDSFR
import "./assets/main.css"

import { createApp } from "vue"
import VueDsfr from "@gouvminint/vue-dsfr"   // Import (par défaut) de la bibliothèque
import App from "./App.vue"
import router from "./router"

const app = createApp(App)

app.use(router)
app.use(VueDsfr)

app.mount("#app")
