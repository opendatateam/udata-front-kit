import type { Resource } from '@/model/resource'
import { describe, expect, it } from 'vitest'
import { resourceFactory } from '../../../cypress/support/factories/resources_factory'
import {
  extractBaseUrl,
  extractLayerNameFromUrl,
  findOgcCompatibleResource,
  isValidLayerName
} from '../ogcServices'

describe('OGC Services', () => {
  describe('findOgcCompatibleResource', () => {
    it('should prioritize WFS over WMS when both are available', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms?layers=test_layer'
          }
        }),
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs?typename=test:layer'
          }
        })
      ]

      const result = findOgcCompatibleResource(resources)

      expect(result.layerInfo).toBeTruthy()
      expect(result.layerInfo?.format).toBe('wfs')
      expect(result.foundWfs).toBe(true)
    })

    it('should prioritize WFS over WMS regardless of order', () => {
      // WFS comes first
      const resources1: Resource[] = [
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

      const result1 = findOgcCompatibleResource(resources1)
      expect(result1.layerInfo?.format).toBe('wfs')
      expect(result1.foundWfs).toBe(true)

      // WMS comes first
      const resources2: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms?layers=test_layer'
          }
        }),
        resourceFactory.one({
          overrides: {
            format: 'wfs',
            url: 'https://example.com/wfs?typename=test:layer'
          }
        })
      ]

      const result2 = findOgcCompatibleResource(resources2)
      expect(result2.layerInfo?.format).toBe('wfs')
      expect(result2.foundWfs).toBe(true)
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

      const result = findOgcCompatibleResource(resources)

      expect(result.layerInfo).toBeTruthy()
      expect(result.layerInfo?.format).toBe('wms')
      expect(result.foundWfs).toBe(false)
    })

    it('should return null if no OGC service is available', () => {
      const resources: Resource[] = [
        resourceFactory.one({ overrides: { format: 'csv' } }),
        resourceFactory.one({ overrides: { format: 'json' } }),
        resourceFactory.one({ overrides: { format: 'pdf' } })
      ]

      const result = findOgcCompatibleResource(resources)

      expect(result.layerInfo).toBeNull()
      expect(result.foundWfs).toBe(false)
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

      const result = findOgcCompatibleResource(resources)

      // Should return WMS since WFS is filtered out
      expect(result.layerInfo?.format).toBe('wms')
      expect(result.layerInfo?.url).not.toContain('.rie.gouv.fr')
      expect(result.foundWfs).toBe(false)
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

      const result = findOgcCompatibleResource(resources)

      expect(result.layerInfo?.layerName).toBe('namespace:layername')
      expect(result.foundWfs).toBe(true)
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

      const result = findOgcCompatibleResource(resources)

      expect(result.layerInfo?.layerName).toBe('valid_layer_name')
      expect(result.foundWfs).toBe(true)
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

      const result = findOgcCompatibleResource(resources)

      // Should return the resource but without a layer name
      expect(result.layerInfo?.format).toBe('wfs')
      expect(result.layerInfo?.layerName).toBe(undefined)
      expect(result.foundWfs).toBe(true)
    })

    it('should only return WMS if it has a valid layer name', () => {
      const resources: Resource[] = [
        resourceFactory.one({
          overrides: {
            format: 'wms',
            url: 'https://example.com/wms', // No layers param
            title: 'Invalid Layer Name'
          }
        })
      ]

      const result = findOgcCompatibleResource(resources)

      // WMS requires a layer name, so should return null
      expect(result.layerInfo).toBeNull()
      expect(result.foundWfs).toBe(false)
    })
  })

  describe('extractBaseUrl', () => {
    it('should remove GetCapabilities parameters', () => {
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

    it('should handle case-insensitive parameter names', () => {
      const url = 'https://example.com/wfs?TYPENAME=namespace:layer'
      const result = extractLayerNameFromUrl(url, 'wfs')

      expect(result).toBe('namespace:layer')
    })

    it('should return null if parameter is not found', () => {
      const url = 'https://example.com/wfs'
      const result = extractLayerNameFromUrl(url, 'wfs')

      expect(result).toBeNull()
    })

    it('should handle typeName variation (camelCase)', () => {
      const url = 'https://example.com/wfs?typeName=namespace:layer'
      const result = extractLayerNameFromUrl(url, 'wfs')

      expect(result).toBe('namespace:layer')
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

    it('should accept layer names at boundary (100 chars)', () => {
      const boundaryName = 'a'.repeat(100)
      expect(isValidLayerName(boundaryName)).toBe(true)
    })
  })
})
