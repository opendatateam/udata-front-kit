// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'

import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

import {
  baseConfigPath,
  CONFIGS_DIR,
  deepMerge,
  DEPLOY_ENVS,
  envConfigPath,
  loadSiteConfig
} from '../site-config.mjs'

// top-level keys an env override may add even if absent from config.yaml
const ALLOWED_NEW_KEYS = ['sentry']
// free-form maps (API params) whose content may differ in keys per env
const OPEN_MAPS = ['universe_query']

type Yaml = Record<string, unknown>

const isObject = (value: unknown): value is Yaml =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const readYaml = (path: string) => load(readFileSync(path, 'utf-8')) as Yaml

// lists override paths that don't exist in base (typos, renamed or stale keys)
function unknownPaths(base: Yaml, override: Yaml, prefix = ''): string[] {
  return Object.entries(override).flatMap(([key, value]) => {
    const path = `${prefix}${key}`
    if (!(key in base)) {
      return prefix === '' && ALLOWED_NEW_KEYS.includes(key) ? [] : [path]
    }
    const baseValue = base[key]
    return isObject(baseValue) && isObject(value) && !OPEN_MAPS.includes(key)
      ? unknownPaths(baseValue, value, `${path}.`)
      : []
  })
}

const sites = readdirSync(CONFIGS_DIR, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(baseConfigPath(entry.name))
  )
  .map((entry) => entry.name)

describe('deepMerge', () => {
  it('merges objects key by key', () => {
    expect(deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3 } })).toEqual({
      a: { b: 1, c: 3 }
    })
  })

  it('replaces arrays and scalars', () => {
    expect(deepMerge({ a: [1, 2], b: 'x' }, { a: [3], b: 'y' })).toEqual({
      a: [3],
      b: 'y'
    })
  })

  it('clears a value with null', () => {
    expect(deepMerge({ a: { b: 1 } }, { a: null })).toEqual({ a: null })
  })

  it('adds new keys', () => {
    expect(deepMerge({ a: 1 }, { b: { c: 2 } })).toEqual({ a: 1, b: { c: 2 } })
  })

  it('does not mutate base', () => {
    const base = { a: { b: 1 } }
    deepMerge(base, { a: { b: 2 } })
    expect(base).toEqual({ a: { b: 1 } })
  })
})

describe.each(sites)('site config %s', (site) => {
  const envDir = `${CONFIGS_DIR}${site}/env`
  const envFiles = existsSync(envDir) ? readdirSync(envDir) : []

  it('only has env overrides for known deploy envs', () => {
    const unknown = envFiles.filter(
      (file) => !DEPLOY_ENVS.some((env) => file === `${env}.yaml`)
    )
    expect(unknown).toEqual([])
  })

  it.each(DEPLOY_ENVS)('env %s only overrides existing keys', (env) => {
    const path = envConfigPath(site, env)
    if (!existsSync(path)) return
    expect(
      unknownPaths(readYaml(baseConfigPath(site)), readYaml(path))
    ).toEqual([])
  })

  it.each(DEPLOY_ENVS)(
    'env %s resolves to a config with SEO settings',
    (env) => {
      const config = loadSiteConfig(site, env)
      expect(config.website.seo.canonical_url).toMatch(/^https:\/\//)
    }
  )
})
