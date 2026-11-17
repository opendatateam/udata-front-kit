// Resolves a site config: configs/<site>/config.yaml, deep-merged with configs/<site>/env/<env>.yaml if any.
// Merge rules: objects merge key by key, scalars and arrays are replaced, null clears a value.
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { load } from 'js-yaml'

export const DEPLOY_ENVS = ['demo', 'preprod', 'prod']

export const CONFIGS_DIR = fileURLToPath(
  new URL('../configs/', import.meta.url)
)

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export function deepMerge(base, override) {
  if (!isObject(base) || !isObject(override)) return override
  const merged = { ...base }
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in base ? deepMerge(base[key], value) : value
  }
  return merged
}

export const baseConfigPath = (siteId) => `${CONFIGS_DIR}${siteId}/config.yaml`

export const envConfigPath = (siteId, deployEnv) =>
  `${CONFIGS_DIR}${siteId}/env/${deployEnv}.yaml`

const readYaml = (path) => load(readFileSync(path, 'utf-8')) ?? {}

export function loadSiteConfig(siteId, deployEnv) {
  if (!siteId) throw new Error('A site id is required to load a site config')
  const base = readYaml(baseConfigPath(siteId))
  if (!deployEnv) return base
  if (!DEPLOY_ENVS.includes(deployEnv)) {
    throw new Error(
      `Unknown deploy env "${deployEnv}", expected one of: ${DEPLOY_ENVS.join(', ')}`
    )
  }
  const envPath = envConfigPath(siteId, deployEnv)
  return existsSync(envPath) ? deepMerge(base, readYaml(envPath)) : base
}
