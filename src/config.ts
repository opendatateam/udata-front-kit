import config from '@siteConfig/config.yaml'

const mode = import.meta.env.MODE
const site_id = import.meta.env.VITE_SITE_ID

// Use Vite's import.meta.glob to conditionally load mode-specific configs
const modeConfigs = import.meta.glob('@siteConfig/config.*.yaml', {
  eager: true
})

console.log(modeConfigs)

// Try to find and merge mode-specific config
let finalConfig = config
const modeConfigKey = `/configs/${site_id}/config.${mode}.yaml`

if (modeConfigs[modeConfigKey]) {
  console.log(
    `Loading and merging config for ${mode} with the default config of ${site_id}`
  )
  const configForMode = modeConfigs[modeConfigKey] as any
  finalConfig = { ...config, ...configForMode.default }
} else {
  console.log(
    `No specific config found for ${mode}, using default config of ${site_id}`
  )
}

console.log(finalConfig)

export default finalConfig
