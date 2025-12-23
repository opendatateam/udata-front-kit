import { describe, expect, it } from 'vitest'
import { type OgcLayerInfo, parseXml } from '../ogcServices'
import {
  generateMultiLayerWfsQlr,
  generateTopicQlr,
  generateWfsQlr,
  generateWmsQlr,
  type TopicLayersByGroup
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

      // Check WFS datasource (space-separated format)
      const datasource = doc.querySelector('datasource')
      const datasourceText = datasource?.textContent || ''
      const params = datasourceText.split(' ')
      expect(params).toContain("typename='test:layer'")
      // URL should be cleaned (OGC request params removed but other params kept)
      expect(params).toContain("url='https://example.com/wfs?custom=value'")

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

      // Check WMS datasource (ampersand-separated format)
      const datasource = doc.querySelector('datasource')
      const datasourceText = datasource?.textContent || ''
      const params = datasourceText.split('&')
      expect(params).toContain('layers=test_layer')
      // URL should be cleaned (OGC request params removed but other params kept)
      expect(params).toContain('url=https://example.com/wms?custom=value')

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

  describe('generateTopicQlr', () => {
    it('should generate valid multi-group topic QLR with WFS and WMS layers', () => {
      const layersByGroup: TopicLayersByGroup[] = [
        {
          groupName: 'Environnement',
          layers: [
            {
              datasetId: 'dataset1',
              datasetTitle: 'Zones protégées',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Zones protégées',
                layerName: 'protected_areas'
              },
              groupName: 'Environnement'
            },
            {
              datasetId: 'dataset2',
              datasetTitle: 'Occupation du sol',
              ogcLayerInfo: {
                url: 'https://example.com/wms',
                format: 'wms',
                title: 'Occupation du sol',
                layerName: 'land_use'
              },
              groupName: 'Environnement'
            }
          ]
        },
        {
          groupName: 'Transport',
          layers: [
            {
              datasetId: 'dataset3',
              datasetTitle: 'Routes',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Routes',
                layerName: 'roads'
              },
              groupName: 'Transport'
            }
          ]
        }
      ]

      const qlr = generateTopicQlr('Mon Topic', layersByGroup, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Debug: print XML if test fails
      // console.log(qlr)

      // Verify root structure
      expect(doc.querySelector('qlr')).toBeTruthy()

      // Verify outer wrapper group (empty name)
      const outerGroups = doc.querySelectorAll('layer-tree-group')
      expect(outerGroups.length).toBeGreaterThan(0)
      expect(outerGroups[0].getAttribute('name')).toBe('')

      // Verify topic group
      const topicGroup = Array.from(outerGroups).find(
        (g) => g.getAttribute('name') === 'Mon Topic'
      )
      expect(topicGroup).toBeTruthy()

      // Verify factor groups
      const factorGroups = topicGroup!.querySelectorAll(
        ':scope > layer-tree-group'
      )
      expect(factorGroups.length).toBe(2)

      const groupNames = Array.from(factorGroups).map((g) =>
        g.getAttribute('name')
      )
      expect(groupNames).toContain('Environnement')
      expect(groupNames).toContain('Transport')

      // Verify layer count
      const allLayers = doc.querySelectorAll('layer-tree-layer')
      expect(allLayers.length).toBe(3)

      // Verify maplayers
      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(3)

      // Verify mixed providers (WFS vector + WMS raster)
      const vectorLayers = doc.querySelectorAll('maplayer[type="vector"]')
      expect(vectorLayers.length).toBe(2)

      const rasterLayers = doc.querySelectorAll('maplayer[type="raster"]')
      expect(rasterLayers.length).toBe(1)

      // Verify providerKey attributes
      const allLayerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      const providerKeys = Array.from(allLayerTreeLayers).map((l) =>
        l.getAttribute('providerKey')
      )

      expect(providerKeys.filter((k) => k === 'WFS').length).toBe(2)
      expect(providerKeys.filter((k) => k === 'WMS').length).toBe(1)
    })

    it('should handle NO_GROUP (Sans regroupement) correctly', () => {
      const layersByGroup: TopicLayersByGroup[] = [
        {
          groupName: 'Sans regroupement',
          layers: [
            {
              datasetId: 'dataset1',
              datasetTitle: 'Dataset sans groupe',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Dataset sans groupe',
                layerName: 'layer1'
              },
              groupName: 'Sans regroupement'
            }
          ]
        }
      ]

      const qlr = generateTopicQlr('Test Topic', layersByGroup, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Verify NO_GROUP is rendered as "Sans regroupement"
      const groups = doc.querySelectorAll('layer-tree-group')
      const noGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Sans regroupement'
      )
      expect(noGroup).toBeTruthy()
    })

    it('should generate unique layer IDs for all layers', () => {
      const layersByGroup: TopicLayersByGroup[] = [
        {
          groupName: 'Group 1',
          layers: [
            {
              datasetId: 'dataset1',
              datasetTitle: 'Dataset 1',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Dataset 1',
                layerName: 'layer1'
              },
              groupName: 'Group 1'
            },
            {
              datasetId: 'dataset2',
              datasetTitle: 'Dataset 2',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Dataset 2',
                layerName: 'layer2'
              },
              groupName: 'Group 1'
            }
          ]
        }
      ]

      const qlr = generateTopicQlr('Test Topic', layersByGroup, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Get all layer IDs
      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      const ids = Array.from(layerTreeLayers).map((l) => l.getAttribute('id'))

      // Verify all IDs are unique
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should use dataset titles as layer names', () => {
      const layersByGroup: TopicLayersByGroup[] = [
        {
          groupName: 'Test Group',
          layers: [
            {
              datasetId: 'dataset1',
              datasetTitle: 'My Custom Dataset Title',
              ogcLayerInfo: {
                url: 'https://example.com/wfs',
                format: 'wfs',
                title: 'Original Title',
                layerName: 'layer1'
              },
              groupName: 'Test Group'
            }
          ]
        }
      ]

      const qlr = generateTopicQlr('Test Topic', layersByGroup, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Verify layer tree layer uses dataset title
      const layerTreeLayer = doc.querySelector('layer-tree-layer')
      expect(layerTreeLayer?.getAttribute('name')).toBe(
        'My Custom Dataset Title'
      )

      // Verify maplayer uses dataset title
      const layername = doc.querySelector('layername')
      expect(layername?.textContent).toBe('My Custom Dataset Title')
    })
  })
})
