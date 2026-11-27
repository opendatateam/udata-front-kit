import { describe, expect, it } from 'vitest'

import { latestRequest } from '../request'

describe('latestRequest', () => {
  it('reports only the most recent request as latest', () => {
    const request = latestRequest()
    const first = request()
    expect(first()).toBe(true)
    const second = request()
    expect(first()).toBe(false)
    expect(second()).toBe(true)
  })

  it('invalidates pending requests when called without using the check', () => {
    const request = latestRequest()
    const pending = request()
    request()
    expect(pending()).toBe(false)
  })

  it('keeps separate trackers independent', () => {
    const a = latestRequest()
    const b = latestRequest()
    const fromA = a()
    b()
    expect(fromA()).toBe(true)
  })
})
