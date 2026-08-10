import { describe, expect, it } from 'vitest'
import { getDatasetIdFromUri } from '../topic'

describe('getDatasetIdFromUri', () => {
  const baseUrls = ['https://www.data.gouv.fr', 'https://ecologie.data.gouv.fr']

  it('matches a www.data.gouv.fr URL', () => {
    expect(
      getDatasetIdFromUri(
        'https://www.data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        baseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches a data.gouv.fr URL without www', () => {
    expect(
      getDatasetIdFromUri(
        'https://data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        baseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches an ecologie.data.gouv.fr URL', () => {
    expect(
      getDatasetIdFromUri(
        'https://ecologie.data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        baseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches when the URI has www but the base URL does not', () => {
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/datasets/abc123', [
        'https://data.gouv.fr'
      ])
    ).toBe('abc123')
  })

  it('matches a URL with a locale path prefix', () => {
    expect(
      getDatasetIdFromUri(
        'https://www.data.gouv.fr/fr/datasets/abc123',
        baseUrls
      )
    ).toBe('abc123')
  })

  it('matches a URL with a trailing slash', () => {
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/datasets/abc123/', baseUrls)
    ).toBe('abc123')
  })

  it('returns null for an unrecognized host', () => {
    expect(
      getDatasetIdFromUri('https://example.com/datasets/abc123', baseUrls)
    ).toBeNull()
  })

  it('returns null for a non-dataset path', () => {
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/datasets', baseUrls)
    ).toBeNull()
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/reuses/abc123', baseUrls)
    ).toBeNull()
  })

  it('returns null for an invalid URL', () => {
    expect(getDatasetIdFromUri('not a url', baseUrls)).toBeNull()
    expect(
      getDatasetIdFromUri('data.gouv.fr/datasets/abc123', baseUrls)
    ).toBeNull()
  })

  it('returns null when no base URLs are provided', () => {
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/datasets/abc123', [
        undefined
      ])
    ).toBeNull()
  })

  it('ignores an invalid base URL and still matches valid ones', () => {
    expect(
      getDatasetIdFromUri('https://www.data.gouv.fr/datasets/abc123', [
        'not a url',
        'https://www.data.gouv.fr'
      ])
    ).toBe('abc123')
  })
})
