import "@gouvfr/dsfr/dist/dsfr.min.css"; // Import des styles du DSFR
import "@gouvminint/vue-dsfr/styles"; // Import des styles globaux propre à VueDSFR
import "vue3-toastify/dist/index.css";
import "vue-loading-overlay/dist/css/index.css";
import "@vueform/multiselect/themes/default.css";
import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import VueDsfr from "@gouvminint/vue-dsfr"; // Import (par défaut) de la bibliothèque
import App from "./App.vue";
import router from "./router";
import * as icons from "./icons.js";

import TextClamp from "vue3-text-clamp";
import { LoadingPlugin } from "vue-loading-overlay";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(VueDsfr, { icons: Object.values(icons) });
app.use(pinia);

app.use(TextClamp);
app.use(LoadingPlugin);

app.mount("#app");
