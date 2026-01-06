import { describe, expect, it } from 'vitest'
import { type OgcLayerInfo, parseXml } from '../ogcServices'
import { generateSingleDatasetQlr, generateTopicQlr } from '../qgis'

describe('QGIS QLR Generation', () => {
  describe('generateSingleDatasetQlr', () => {
    it('should generate QLR with Dataset > Resource > Layer structure for single WFS layer', () => {
      const layers: OgcLayerInfo[] = [
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'WFS Service',
          layerName: 'test_layer'
        }
      ]

      const layersByDataset = new Map([['Test Dataset', layers]])
      const qlr = generateSingleDatasetQlr(layersByDataset, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Check structure: outer group > dataset group > resource group > layer
      const groups = doc.querySelectorAll('layer-tree-group')
      expect(groups.length).toBe(3) // outer (empty name) + dataset + resource

      const datasetGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Test Dataset'
      )
      expect(datasetGroup).toBeTruthy()

      const resourceGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'WFS Service'
      )
      expect(resourceGroup).toBeTruthy()

      // Check layer
      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers.length).toBe(1)
      expect(layerTreeLayers[0]?.getAttribute('name')).toBe('test_layer')
      expect(layerTreeLayers[0]?.getAttribute('providerKey')).toBe('WFS')

      // Check maplayer
      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(1)
      expect(maplayers[0]?.getAttribute('type')).toBe('vector')

      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('wfs')
    })

    it('should generate QLR for WMS layer', () => {
      const layers: OgcLayerInfo[] = [
        {
          url: 'https://example.com/wms',
          format: 'wms',
          resourceTitle: 'WMS Service',
          layerName: 'wms_layer'
        }
      ]

      const layersByDataset = new Map([['WMS Dataset', layers]])
      const qlr = generateSingleDatasetQlr(layersByDataset, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Check WMS specifics
      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers[0]?.getAttribute('providerKey')).toBe('WMS')

      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers[0]?.getAttribute('type')).toBe('raster')

      const provider = doc.querySelector('provider')
      expect(provider?.textContent).toBe('wms')
    })

    it('should generate QLR with multiple WFS layers', () => {
      const layers: OgcLayerInfo[] = [
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'WFS Service',
          layerName: 'layer1'
        },
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'WFS Service',
          layerName: 'layer2'
        },
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'WFS Service',
          layerName: 'layer3'
        }
      ]

      const layersByDataset = new Map([['Multi-layer Dataset', layers]])
      const qlr = generateSingleDatasetQlr(layersByDataset, 'EPSG:4326')
      const doc = parseXml(qlr)

      // Should have 3 layers
      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers.length).toBe(3)
      expect(layerTreeLayers[0]?.getAttribute('name')).toBe('layer1')
      expect(layerTreeLayers[1]?.getAttribute('name')).toBe('layer2')
      expect(layerTreeLayers[2]?.getAttribute('name')).toBe('layer3')

      // Should have 3 maplayers
      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(3)
    })
  })

  describe('generateTopicQlr', () => {
    it('should generate QLR with Topic > Factor Group > Dataset > Resource > Layer structure', () => {
      const layersByGroup = new Map<string, Map<string, OgcLayerInfo[]>>()

      const groupALayers = new Map<string, OgcLayerInfo[]>()
      groupALayers.set('Dataset 1', [
        {
          url: 'https://example.com/wfs1',
          format: 'wfs',
          resourceTitle: 'Resource 1',
          layerName: 'layer1'
        }
      ])
      groupALayers.set('Dataset 2', [
        {
          url: 'https://example.com/wfs2',
          format: 'wfs',
          resourceTitle: 'Resource 2',
          layerName: 'layer2'
        }
      ])
      layersByGroup.set('Group A', groupALayers)

      const groupBLayers = new Map<string, OgcLayerInfo[]>()
      groupBLayers.set('Dataset 3', [
        {
          url: 'https://example.com/wms1',
          format: 'wms',
          resourceTitle: 'Resource 3',
          layerName: 'layer3'
        }
      ])
      layersByGroup.set('Group B', groupBLayers)

      const qlr = generateTopicQlr(layersByGroup, 'Test Topic', 'EPSG:4326')
      const doc = parseXml(qlr)

      // Check topic group
      const groups = doc.querySelectorAll('layer-tree-group')
      const topicGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Test Topic'
      )
      expect(topicGroup).toBeTruthy()

      // Check factor groups
      const groupA = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Group A'
      )
      expect(groupA).toBeTruthy()

      const groupB = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Group B'
      )
      expect(groupB).toBeTruthy()

      // Check dataset groups
      const dataset1 = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Dataset 1'
      )
      expect(dataset1).toBeTruthy()

      const dataset2 = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Dataset 2'
      )
      expect(dataset2).toBeTruthy()

      const dataset3 = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Dataset 3'
      )
      expect(dataset3).toBeTruthy()

      // Check resource groups
      const resource1 = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Resource 1'
      )
      expect(resource1).toBeTruthy()

      // Check layers
      const layers = doc.querySelectorAll('layer-tree-layer')
      expect(layers.length).toBe(3)

      // Check maplayers (2 WFS + 1 WMS)
      const maplayers = doc.querySelectorAll('maplayer')
      expect(maplayers.length).toBe(3)

      const providers = Array.from(doc.querySelectorAll('provider'))
      const wfsProviders = providers.filter((p) => p.textContent === 'wfs')
      const wmsProviders = providers.filter((p) => p.textContent === 'wms')
      expect(wfsProviders.length).toBe(2)
      expect(wmsProviders.length).toBe(1)
    })

    it('should handle Sans regroupement group', () => {
      const layersByGroup = new Map<string, Map<string, OgcLayerInfo[]>>()

      const noGroupLayers = new Map<string, OgcLayerInfo[]>()
      noGroupLayers.set('Dataset', [
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'Resource',
          layerName: 'layer'
        }
      ])
      layersByGroup.set('Sans regroupement', noGroupLayers)

      const qlr = generateTopicQlr(layersByGroup, 'Test Topic', 'EPSG:4326')
      const doc = parseXml(qlr)

      const groups = doc.querySelectorAll('layer-tree-group')
      const noGroup = Array.from(groups).find(
        (g) => g.getAttribute('name') === 'Sans regroupement'
      )
      expect(noGroup).toBeTruthy()
    })

    it('should handle mixed WFS and WMS layers', () => {
      const layersByGroup = new Map<string, Map<string, OgcLayerInfo[]>>()

      const mixedGroup = new Map<string, OgcLayerInfo[]>()
      mixedGroup.set('WFS Dataset', [
        {
          url: 'https://example.com/wfs',
          format: 'wfs',
          resourceTitle: 'WFS Resource',
          layerName: 'wfs_layer'
        }
      ])
      mixedGroup.set('WMS Dataset', [
        {
          url: 'https://example.com/wms',
          format: 'wms',
          resourceTitle: 'WMS Resource',
          layerName: 'wms_layer'
        }
      ])
      layersByGroup.set('Mixed Group', mixedGroup)

      const qlr = generateTopicQlr(layersByGroup, 'Test Topic', 'EPSG:4326')
      const doc = parseXml(qlr)

      const layerTreeLayers = doc.querySelectorAll('layer-tree-layer')
      expect(layerTreeLayers.length).toBe(2)

      const wfsLayer = Array.from(layerTreeLayers).find(
        (l) => l.getAttribute('providerKey') === 'WFS'
      )
      const wmsLayer = Array.from(layerTreeLayers).find(
        (l) => l.getAttribute('providerKey') === 'WMS'
      )
      expect(wfsLayer).toBeTruthy()
      expect(wmsLayer).toBeTruthy()
    })
  })
})
