// Resolves a site config: configs/<site>/config.yaml, with configs/<site>/env/<env>.yaml applied as a JSON Merge Patch (RFC 7396).
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { load } from 'js-yaml'
import mergePatch from 'json-merge-patch'

export const DEPLOY_ENVS = ['demo', 'preprod', 'prod']

export const CONFIGS_DIR = fileURLToPath(
  new URL('../configs/', import.meta.url)
)

// json-merge-patch mutates its target, so patch a copy
export const applyMergePatch = (base, patch) =>
  mergePatch.apply(structuredClone(base), patch)

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
  return existsSync(envPath) ? applyMergePatch(base, readYaml(envPath)) : base
}
