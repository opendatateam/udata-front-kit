import { reactive } from 'vue'

import rawConfig from '@siteConfig/config.yaml'

// Reactive so the in-app config editor (see views/ConfigEditorView.vue) can
// mutate it directly and have consumers (wrapped in computed()) hot-update.
// structuredClone so we never mutate the raw import cache shared across HMR.
const config = reactive(structuredClone(rawConfig)) as typeof rawConfig

export default config
