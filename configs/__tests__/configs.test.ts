// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'

import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

import { CONFIGS_DIR, DEPLOY_ENVS } from '../../scripts/site-config'

type Yaml = Record<string, unknown>

const readYaml = (path: string) => load(readFileSync(path, 'utf-8')) as Yaml

const isObject = (value: unknown): value is Yaml =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

// keys an override may add: a top-level sentry block, and any universe_query (API params)
const mayBeNew = (path: string[]) =>
  path.join('.') === 'sentry' || path.includes('universe_query')

// override keys missing from base, i.e. typos, renamed or stale keys
function unknownKeys(
  base: Yaml,
  override: Yaml,
  path: string[] = []
): string[] {
  return Object.entries(override).flatMap(([key, value]) => {
    const keyPath = [...path, key]
    if (mayBeNew(keyPath)) return []
    if (!(key in base)) return [keyPath.join('.')]
    const baseValue = base[key]
    return isObject(baseValue) && isObject(value)
      ? unknownKeys(baseValue, value, keyPath)
      : []
  })
}

// <site>/env/<file> for every env override file
const envFiles = readdirSync(CONFIGS_DIR).flatMap((site) => {
  const envDir = `${CONFIGS_DIR}${site}/env`
  return existsSync(envDir)
    ? readdirSync(envDir).map((file) => `${site}/env/${file}`)
    : []
})

describe.each(envFiles)('%s', (envFile) => {
  const [site, , file] = envFile.split('/')

  it('is named after a deploy env', () => {
    expect(DEPLOY_ENVS.map((env) => `${env}.yaml`)).toContain(file)
  })

  it('only overrides keys from config.yaml', () => {
    const base = readYaml(`${CONFIGS_DIR}${site}/config.yaml`)
    const override = readYaml(`${CONFIGS_DIR}${envFile}`)
    expect(unknownKeys(base, override)).toEqual([])
  })
})
