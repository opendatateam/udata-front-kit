import { reactive } from 'vue'

import LocalStorageService from '@/services/LocalStorageService'
import rawConfig from '@siteConfig/config.yaml'

// Shared with ConfigEditorView.vue, which writes to this same key on save.
export const configStorageKey = `config-editor:${rawConfig.site_id}`

// The pristine, as-shipped config.yaml — exported so ConfigDebugPanel.vue
// can diff the live (possibly locally-edited) config against it.
export { rawConfig }

// A locally-saved config is only ever loaded on sites that shipped with the
// in-app config editor enabled (see configs/default/config.yaml) — never on
// a real deployed thematic site, and never for a visitor who's never opened
// the editor themselves (nothing gets written to this key otherwise).
function initialConfig(): typeof rawConfig {
  if (rawConfig.website?.header?.show_config_editor !== true) {
    return rawConfig
  }
  const saved = LocalStorageService.getItem(configStorageKey)
  if (saved && typeof saved === 'object') {
    return saved as typeof rawConfig
  }
  return rawConfig
}

// Reactive so the in-app config editor (see views/ConfigEditorView.vue) can
// mutate it directly and have consumers (wrapped in computed()) hot-update.
// structuredClone so we never mutate the raw import cache shared across HMR.
const config = reactive(structuredClone(initialConfig())) as typeof rawConfig

export default config
