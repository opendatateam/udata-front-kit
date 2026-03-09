import type { Resource } from '@/model/resource'
import { describe, expect, it } from 'vitest'
import { resourceFactory } from '../../../cypress/support/factories/resources_factory'
import {
  extractBaseUrl,
  extractLayerNameFromUrl,
  findAllOgcCompatibleResources,
  isValidLayerName
} from '../ogcServices'

describe('OGC Services', () => {
  describe('findAllOgcCompatibleResources', () => {
    it('should return both WFS and WMS resources when both are present', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs?typename=test:layer'
          }
        }),
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms?layers=test_layer'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)
      expect(result.length).toBe(2)
      expect(result.some((r) => r.format === 'wfs')).toBe(true)
      expect(result.some((r) => r.format === 'wms')).toBe(true)
    })

    it('should return WMS if no WFS is available', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'csv'
          }
        }),
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms?layers=test_layer'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      expect(result.length).toBe(1)
      expect(result[0].format).toBe('wms')
    })

    it('should return empty array if no OGC service is available', () => {
      const resources: Resource[] = [
        resourceFactory.one({ overrides: { format: 'csv' } }),
        resourceFactory.one({ overrides: { format: 'json' } }),
        resourceFactory.one({ overrides: { format: 'pdf' } })
      ]

      const result = findAllOgcCompatibleResources(resources)

      expect(result).toHaveLength(0)
    })

    it('should filter out intranet URLs (*.rie.gouv.fr)', () => {
      const resources = [
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://internal.rie.gouv.fr/wfs?typename=test:layer'
          }
        }),
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://public.example.com/wms?layers=test_layer'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      // Intranet WFS filtered out; only public WMS returned
      expect(result.length).toBe(1)
      expect(result[0].format).toBe('wms')
      expect(result[0].url).not.toContain('.rie.gouv.fr')
    })

    it('should extract layer name from URL parameters', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs?typename=namespace:layername'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      expect(result[0]?.layerName).toBe('namespace:layername')
      expect(result[0]?.format).toBe('wfs')
    })

    it('should use resource title as layer name if it is valid', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs',
            title: 'valid_layer_name'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      expect(result[0]?.layerName).toBe('valid_layer_name')
      expect(result[0]?.format).toBe('wfs')
    })

    it('should not use resource title if it contains spaces', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs',
            title: 'Invalid Layer Name With Spaces'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      // WFS returned but without a layer name (resolved later via GetCapabilities)
      expect(result[0]?.format).toBe('wfs')
      expect(result[0]?.layerName).toBe(undefined)
    })

    it('should only include WMS if it has a valid layer name', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms', // No layers param
            title: 'Invalid Layer Name'
          }
        })
      ]

      const result = findAllOgcCompatibleResources(resources)

      // WMS requires a layer name
      expect(result).toHaveLength(0)
    })
  })

  describe('extractBaseUrl', () => {
    it('should remove OGC request parameters (service, request)', () => {
      const url = 'https://example.com/wfs?service=WFS&request=GetCapabilities'
      const result = extractBaseUrl(url)

      expect(result).toBe('https://example.com/wfs')
    })

    it('should keep other query parameters', () => {
      const url =
        'https://example.com/wfs?service=WFS&request=GetCapabilities&version=2.0.0'
      const result = extractBaseUrl(url)

      expect(result).toBe('https://example.com/wfs?version=2.0.0')
    })

    it('should handle URLs without query parameters', () => {
      const url = 'https://example.com/wfs'
      const result = extractBaseUrl(url)

      expect(result).toBe('https://example.com/wfs')
    })
  })

  describe('extractLayerNameFromUrl', () => {
    it('should extract typename from WFS URL', () => {
      const url = 'https://example.com/wfs?typename=namespace:layer'
      const result = extractLayerNameFromUrl(url, 'wfs')

      expect(result).toBe('namespace:layer')
    })

    it('should extract layers from WMS URL', () => {
      const url = 'https://example.com/wms?layers=test_layer'
      const result = extractLayerNameFromUrl(url, 'wms')

      expect(result).toBe('test_layer')
    })

    it('should handle parameter name variations (case-insensitive and camelCase)', () => {
      // Uppercase
      const url1 = 'https://example.com/wfs?TYPENAME=namespace:layer'
      const result1 = extractLayerNameFromUrl(url1, 'wfs')
      expect(result1).toBe('namespace:layer')

      // CamelCase
      const url2 = 'https://example.com/wfs?typeName=namespace:layer'
      const result2 = extractLayerNameFromUrl(url2, 'wfs')
      expect(result2).toBe('namespace:layer')
    })

    it('should return null if parameter is not found', () => {
      const url = 'https://example.com/wfs'
      const result = extractLayerNameFromUrl(url, 'wfs')

      expect(result).toBeNull()
    })
  })

  describe('isValidLayerName', () => {
    it('should accept valid layer names', () => {
      expect(isValidLayerName('layer_name')).toBe(true)
      expect(isValidLayerName('namespace:layer')).toBe(true)
      expect(isValidLayerName('layer-with-dashes')).toBe(true)
      expect(isValidLayerName('layer.with.dots')).toBe(true)
      expect(isValidLayerName('LAYER123')).toBe(true)
    })

    it('should reject layer names with spaces', () => {
      expect(isValidLayerName('layer with spaces')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(isValidLayerName('')).toBe(false)
    })

    it('should reject very long strings (>100 chars)', () => {
      const longName = 'a'.repeat(101)
      expect(isValidLayerName(longName)).toBe(false)
    })

    it('should reject layer names with special characters', () => {
      expect(isValidLayerName('layer@name')).toBe(false)
      expect(isValidLayerName('layer#name')).toBe(false)
      expect(isValidLayerName('layer/name')).toBe(false)
    })

    it('should accept layer names at boundaries (1 and 100 chars)', () => {
      // Lower boundary: 1 character
      expect(isValidLayerName('a')).toBe(true)

      // Upper boundary: 100 characters
      const boundaryName = 'a'.repeat(100)
      expect(isValidLayerName(boundaryName)).toBe(true)
    })
  })
})
