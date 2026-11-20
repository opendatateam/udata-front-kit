// Resolves a site config: configs/<site>/config.yaml, with configs/<site>/env/<env>.yaml applied as a JSON Merge Patch (RFC 7396).
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { load } from 'js-yaml'
import { apply } from 'json-merge-patch'

export const DEPLOY_ENVS = ['demo', 'preprod', 'prod'] as const
type DeployEnv = (typeof DEPLOY_ENVS)[number]

type Yaml = Record<string, unknown>

export const CONFIGS_DIR = fileURLToPath(
  new URL('../configs/', import.meta.url)
)

const isDeployEnv = (value: string): value is DeployEnv =>
  (DEPLOY_ENVS as readonly string[]).includes(value)

// json-merge-patch mutates its target, so patch a copy
export const applyMergePatch = <T>(base: T, patch: unknown): T =>
  apply(structuredClone(base), patch) as T

const baseConfigPath = (siteId: string) => `${CONFIGS_DIR}${siteId}/config.yaml`

const envConfigPath = (siteId: string, deployEnv: DeployEnv) =>
  `${CONFIGS_DIR}${siteId}/env/${deployEnv}.yaml`

const readYaml = (path: string): Yaml =>
  (load(readFileSync(path, 'utf-8')) as Yaml | undefined) ?? {}

export function loadSiteConfig<T = Yaml>(
  siteId: string,
  deployEnv?: string
): T {
  if (!siteId) throw new Error('A site id is required to load a site config')
  const base = readYaml(baseConfigPath(siteId))
  if (!deployEnv) return base as T
  if (!isDeployEnv(deployEnv)) {
    throw new Error(
      `Unknown deploy env "${deployEnv}", expected one of: ${DEPLOY_ENVS.join(', ')}`
    )
  }
  const envPath = envConfigPath(siteId, deployEnv)
  const config = existsSync(envPath)
    ? applyMergePatch(base, readYaml(envPath))
    : base
  return config as T
}
