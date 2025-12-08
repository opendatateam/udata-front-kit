import { describe, expect, it } from 'vitest'
import { type OgcLayerInfo, parseXml } from '../ogcServices'
import {
  generateMultiLayerWfsQlr,
  generateWfsQlr,
  generateWmsQlr
} from '../qgis'

describe('QGIS QLR Generation', () => {
  describe('generateWfsQlr', () => {
    it('should generate valid WFS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs?service=WFS&request=GetCapabilities&custom=value',
        format: 'wfs',
        title: 'Test WFS Layer',
        layerName: 'test:layer'
      }

      const qlr = generateWfsQlr(layerInfo, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Verify it's a valid QLR document
      expect(doc.querySelector('qlr')).toBeTruthy()

      // Check provider
      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('wfs')

      // Check maplayer type
      const maplayer = doc.querySelector('maplayer')
      expect(maplayer?.getAttribute('type')).toBe('vector')

      // Check layer id
      const datasource = doc.querySelector('datasource')
      expect(datasource?.textContent).toContain("typename='test:layer'")

      // Check base url in datasource (with quotes for WFS)
      // URL should be cleaned (OGC request params removed but other params kept)
      expect(datasource?.textContent).toContain(
        "url='https://example.com/wfs?custom=value'"
      )

      // Check layer name from title
      const layername = doc.querySelector('layername')
      expect(layername?.textContent).toBe('Test WFS Layer')
    })
  })

  describe('generateWmsQlr', () => {
    it('should generate valid WMS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wms?service=WMS&request=GetCapabilities&custom=value',
        format: 'wms',
        title: 'Test WMS Layer',
        layerName: 'test_layer'
      }

      const qlr = generateWmsQlr(layerInfo, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Verify it's a valid QLR document
      expect(doc.querySelector('qlr')).toBeTruthy()

      // Check provider
      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('wms')

      // Check maplayer type
      const maplayer = doc.querySelector('maplayer')
      expect(maplayer?.getAttribute('type')).toBe('raster')

      // Check layer id
      const datasource = doc.querySelector('datasource')
      expect(datasource?.textContent).toContain('layers=test_layer')

      // Check base url in datasource (no quotes for WMS)
      // URL should be cleaned (OGC request params removed but other params kept)
      expect(datasource?.textContent).toContain(
        'url=https://example.com/wms?custom=value'
      )

      // Check layer name from title
      const layername = doc.querySelector('layername')
      expect(layername?.textContent).toBe('Test WMS Layer')
    })
  })

  describe('generateMultiLayerWfsQlr', () => {
    it('should generate valid multi-layer WFS QLR XML', () => {
      const layerInfo: OgcLayerInfo = {
        url: 'https://example.com/wfs',
        format: 'wfs',
        title: 'WFS Service'
      }

      const layerNames = ['layer1', 'layer2', 'namespace:layer3']

      const qlr = generateMultiLayerWfsQlr(layerInfo, layerNames, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Verify it's a valid QLR document
      expect(doc.querySelector('qlr')).toBeTruthy()

      // Check layers tree
      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers.length).toBe(3)

      // Check map layers
      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(3)

      // Check layer id for every layer
      const datasources = doc.querySelectorAll('datasource')
      expect(datasources[0]?.textContent).toContain("typename='layer1'")
      expect(datasources[1]?.textContent).toContain("typename='layer2'")
      expect(datasources[2]?.textContent).toContain(
        "typename='namespace:layer3'"
      )

      // Check title in groups
      const groups = doc.querySelectorAll('layer-tree-group')
      const namedGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'WFS Service'
      )
      expect(namedGroup).toBeTruthy()
    })
  })
})
