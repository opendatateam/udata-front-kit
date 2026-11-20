// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { applyMergePatch } from '../site-config'

// RFC 7396 behaviours the env overrides rely on
describe('applyMergePatch', () => {
  it('merges objects key by key', () => {
    expect(applyMergePatch({ a: { b: 1, c: 2 } }, { a: { c: 3 } })).toEqual({
      a: { b: 1, c: 3 }
    })
  })

  it('replaces arrays and scalars', () => {
    expect(applyMergePatch({ a: [1, 2], b: 'x' }, { a: [3], b: 'y' })).toEqual({
      a: [3],
      b: 'y'
    })
  })

  it('removes a key set to null', () => {
    expect(applyMergePatch({ a: { b: 1 }, c: 1 }, { a: null })).toEqual({
      c: 1
    })
  })

  it('adds new keys', () => {
    expect(applyMergePatch({ a: 1 }, { b: { c: 2 } })).toEqual({
      a: 1,
      b: { c: 2 }
    })
  })

  it('does not mutate base', () => {
    const base = { a: { b: 1 } }
    applyMergePatch(base, { a: { b: 2 } })
    expect(base).toEqual({ a: { b: 1 } })
  })
})
