import { describe, expect, it } from 'vitest'
import type { OgcLayerInfo } from '../ogcServices'
import {
  generateMultiLayerWfsQlr,
  generateWfsQlr,
  generateWmsQlr
} from '../qgis'

/**
 * Helper to parse XML string into a DOM Document
 */
function parseXml(xmlString: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`XML parsing failed: ${parserError.textContent}`)
  }

  return doc
}

describe('QGIS QLR Generation', () => {
  describe('generateWfsQlr', () => {
    it('should generate valid WFS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs?service=WFS&request=GetCapabilities',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      // Verify it's a valid QLR document
      expect(doc.querySelector('qlr')).toBeTruthy()
    })

    it('should set correct provider for WFS', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('WFS')
    })

    it('should set correct layer type for WFS (vector)', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      const maplayer = doc.querySelector('maplayer')
      expect(maplayer?.getAttribute('type')).toBe('vector')
    })

    it('should include typename in datasource', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      const datasource = doc.querySelector('datasource')
      expect(datasource?.textContent).toContain("typename='test:layer'")
    })

    it('should include base URL in datasource', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs?service=WFS&request=GetCapabilities',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      const datasource = doc.querySelector('datasource')
      // URL should be cleaned (GetCapabilities params removed)
      expect(datasource?.textContent).toContain("url='https://example.com/wfs'")
    })

    it('should set layer name from title', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'My WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo)
      const doc = parseXml(qlr)

      const layername = doc.querySelector('layername')
      expect(layername?.textContent).toBe('My WFS Layer')
    })
  })

  describe('generateWmsQlr', () => {
    it('should generate valid WMS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo)
      const doc = parseXml(qlr)

      expect(doc.querySelector('qlr')).toBeTruthy()
    })

    it('should set correct provider for WMS', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo)
      const doc = parseXml(qlr)

      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('wms')
    })

    it('should set correct layer type for WMS (raster)', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo)
      const doc = parseXml(qlr)

      const maplayer = doc.querySelector('maplayer')
      expect(maplayer?.getAttribute('type')).toBe('raster')
    })

    it('should include layers parameter in datasource', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo)
      const doc = parseXml(qlr)

      const datasource = doc.querySelector('datasource')
      expect(datasource?.textContent).toContain('layers=test_layer')
    })

    it('should include url parameter in datasource', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms?service=WMS&request=GetCapabilities',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo)
      const doc = parseXml(qlr)

      const datasource = doc.querySelector('datasource')
      // URL should be cleaned
      expect(datasource?.textContent).toContain('url=https://example.com/wms')
    })
  })

  describe('generateMultiLayerWfsQlr', () => {
    it('should generate valid multi-layer WFS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'WFS Service'
      }

      const layerNames = ['layer1', 'layer2', 'layer3']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames)
      const doc = parseXml(qlr)

      expect(doc.querySelector('qlr')).toBeTruthy()
    })

    it('should create layer-tree-layer for each layer', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'WFS Service'
      }

      const layerNames = ['layer1', 'layer2', 'layer3']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames)
      const doc = parseXml(qlr)

      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers.length).toBe(3)
    })

    it('should create maplayer for each layer', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'WFS Service'
      }

      const layerNames = ['layer1', 'layer2', 'layer3']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames)
      const doc = parseXml(qlr)

      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(3)
    })

    it('should set correct typename for each layer', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'WFS Service'
      }

      const layerNames = ['namespace:layer1', 'namespace:layer2']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames)
      const doc = parseXml(qlr)

      const datasources = doc.querySelectorAll('datasource')
      expect(datasources[0]?.textContent).toContain(
        "typename='namespace:layer1'"
      )
      expect(datasources[1]?.textContent).toContain(
        "typename='namespace:layer2'"
      )
    })

    it('should create a layer-tree-group with title', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'My WFS Service'
      }

      const layerNames = ['layer1']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames)
      const doc = parseXml(qlr)

      const groups = doc.querySelectorAll('layer-tree-group')
      const namedGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'My WFS Service'
      )
      expect(namedGroup).toBeTruthy()
    })
  })
})
