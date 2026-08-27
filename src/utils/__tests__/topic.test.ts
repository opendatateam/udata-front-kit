import { describe, expect, it } from 'vitest'
import { getSlugFromUri } from '../topic'

describe('getSlugFromUri', () => {
  const datasetBaseUrls = [
    'https://www.data.gouv.fr',
    'https://ecologie.data.gouv.fr'
  ]

  it('matches a www.data.gouv.fr URL', () => {
    expect(
      getSlugFromUri(
        'https://www.data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        'datasets',
        datasetBaseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches a data.gouv.fr URL without www', () => {
    expect(
      getSlugFromUri(
        'https://data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        'datasets',
        datasetBaseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches an ecologie.data.gouv.fr URL', () => {
    expect(
      getSlugFromUri(
        'https://ecologie.data.gouv.fr/datasets/61489f2f2de14040f348fa0b',
        'datasets',
        datasetBaseUrls
      )
    ).toBe('61489f2f2de14040f348fa0b')
  })

  it('matches when the URI has www but the base URL does not', () => {
    expect(
      getSlugFromUri('https://www.data.gouv.fr/datasets/abc123', 'datasets', [
        'https://data.gouv.fr'
      ])
    ).toBe('abc123')
  })

  it('matches a URL with a locale path prefix', () => {
    expect(
      getSlugFromUri(
        'https://www.data.gouv.fr/fr/datasets/abc123',
        'datasets',
        datasetBaseUrls
      )
    ).toBe('abc123')
  })

  it('matches a URL with a trailing slash', () => {
    expect(
      getSlugFromUri(
        'https://www.data.gouv.fr/datasets/abc123/',
        'datasets',
        datasetBaseUrls
      )
    ).toBe('abc123')
  })

  it('matches a different resource name (e.g. topics)', () => {
    expect(
      getSlugFromUri('https://ecologie.data.gouv.fr/topics/abc123', 'topics', [
        'https://ecologie.data.gouv.fr'
      ])
    ).toBe('abc123')
  })

  it('does not match a data.gouv.fr URL when only the site base URL is allowed (topics/collections)', () => {
    expect(
      getSlugFromUri('https://www.data.gouv.fr/topics/abc123', 'topics', [
        'https://ecologie.data.gouv.fr'
      ])
    ).toBeNull()
  })

  it('returns null for an unrecognized host', () => {
    expect(
      getSlugFromUri(
        'https://example.com/datasets/abc123',
        'datasets',
        datasetBaseUrls
      )
    ).toBeNull()
  })

  it('returns null for a non-matching resource path', () => {
    expect(
      getSlugFromUri(
        'https://www.data.gouv.fr/datasets',
        'datasets',
        datasetBaseUrls
      )
    ).toBeNull()
    expect(
      getSlugFromUri(
        'https://www.data.gouv.fr/reuses/abc123',
        'datasets',
        datasetBaseUrls
      )
    ).toBeNull()
  })

  it('returns null for an invalid URL', () => {
    expect(getSlugFromUri('not a url', 'datasets', datasetBaseUrls)).toBeNull()
    expect(
      getSlugFromUri(
        'data.gouv.fr/datasets/abc123',
        'datasets',
        datasetBaseUrls
      )
    ).toBeNull()
  })

  it('returns null when no base URLs are provided', () => {
    expect(
      getSlugFromUri('https://www.data.gouv.fr/datasets/abc123', 'datasets', [
        undefined
      ])
    ).toBeNull()
  })

  it('ignores an invalid base URL and still matches valid ones', () => {
    expect(
      getSlugFromUri('https://www.data.gouv.fr/datasets/abc123', 'datasets', [
        'not a url',
        'https://www.data.gouv.fr'
      ])
    ).toBe('abc123')
  })
})
