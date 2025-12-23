import { create } from 'xmlbuilder2'
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces'
import type { OGC_SERVICE_FORMAT, OgcLayerInfo } from './ogcServices'
import { extractBaseUrl, fetchWfsLayerNames } from './ogcServices'

/**
 * Information about a dataset's OGC layer within a topic
 */
export interface TopicDatasetLayer {
  datasetId: string
  datasetTitle: string
  ogcLayerInfo: OgcLayerInfo
  groupName: string // The factor group (or NO_GROUP)
}

/**
 * Collection of layers organized by groups
 */
export interface TopicLayersByGroup {
  groupName: string
  layers: TopicDatasetLayer[]
}

/**
 * CRS (Coordinate Reference System) definitions for QGIS layers
 * Each field corresponds to epsg.io API endpoints:
 * - authid: EPSG code identifier (e.g. "EPSG:4326")
 * - srid: Spatial Reference System ID - numeric part only (e.g. "4326")
 * - proj4: Proj4 string from https://epsg.io/{code}.proj4
 *
 * To add a new CRS:
 * 1. Fetch proj4 string from https://epsg.io/{code}.proj4
 * 2. Add entry here with authid, srid, and proj4 fields
 */
const CRS_DEFINITIONS = {
  'EPSG:4326': {
    authid: 'EPSG:4326',
    srid: '4326',
    proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs'
  }
}

type SupportedCrs = keyof typeof CRS_DEFINITIONS
const DEFAULT_PROJECTION = 'EPSG:4326'

type LAYER_TYPE = 'raster' | 'vector'

/**
 * Generates a unique ID for QGIS layers
 */
function generateId(): string {
  return `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Adds a maplayer element with all its children
 */
function addMaplayer(
  parent: XMLBuilder,
  id: string,
  datasource: string,
  provider: OGC_SERVICE_FORMAT,
  layerName: string,
  type: LAYER_TYPE,
  crs: SupportedCrs
) {
  const crsDef = CRS_DEFINITIONS[crs]

  const maplayer = parent.ele('maplayer', {
    type: type,
    hasScaleBasedVisibilityFlag: '0'
  })

  maplayer.ele('id').txt(id)
  maplayer.ele('datasource').txt(datasource)
  maplayer.ele('provider').txt(provider)
  maplayer.ele('layername').txt(layerName)

  // Add CRS info from CRS_DEFINITIONS
  const spatialrefsys = maplayer.ele('srs').ele('spatialrefsys')
  spatialrefsys.ele('proj4').txt(crsDef.proj4)
  spatialrefsys.ele('srid').txt(crsDef.srid)
  spatialrefsys.ele('authid').txt(crsDef.authid)

  return maplayer
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content
 */
function generateQlr(
  layerInfo: OgcLayerInfo,
  type: LAYER_TYPE,
  provider: OGC_SERVICE_FORMAT,
  datasource: string,
  crs: SupportedCrs
): string {
  const { title = 'Layer' } = layerInfo

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')

  // Add layer-tree-layer
  root
    .ele('layer-tree-layer', {
      name: title,
      expanded: '1',
      checked: 'Qt::Checked'
    })
    .ele('customproperties')
    .up()

  // Add maplayers
  const maplayers = root.ele('maplayers')
  addMaplayer(maplayers, generateId(), datasource, provider, title, type, crs)

  return root.end({ prettyPrint: true })
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content for WMS layers
 * @internal Exported for testing
 */
export function generateWmsQlr(
  layerInfo: OgcLayerInfo,
  crs: SupportedCrs
): string {
  const { url, layerName } = layerInfo

  if (!layerName) throw Error('layerName is required for WMS layers')

  // Clean URL for consistency
  const baseUrl = extractBaseUrl(url)

  const datasource = [
    'contextualWMSLegend=0',
    `crs=${crs}`,
    'dpiMode=7',
    'featureCount=10',
    'format=image/png',
    `layers=${layerName}`,
    'styles',
    `url=${baseUrl}`
  ].join('&')

  return generateQlr(layerInfo, 'raster', 'wms', datasource, crs)
}

/**
 * Builds WFS datasource string
 */
function buildWfsDatasource(
  baseUrl: string,
  typename: string,
  crs: SupportedCrs
): string {
  const params = [
    "pagingEnabled='true'",
    "preferCoordinatesForWfsT11='false'",
    "restrictToRequestBBOX='1'",
    `srsname='${crs}'`,
    `typename='${typename}'`,
    `url='${baseUrl}'`,
    "version='auto'",
    'table=""'
  ]
  return params.join(' ')
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content for WFS layers
 * @internal Exported for testing
 */
export function generateWfsQlr(
  layerInfo: OgcLayerInfo,
  crs: SupportedCrs
): string {
  const { url, layerName = '' } = layerInfo
  const baseUrl = extractBaseUrl(url)
  const datasource = buildWfsDatasource(baseUrl, layerName, crs)

  return generateQlr(layerInfo, 'vector', 'wfs', datasource, crs)
}

/**
 * Generates a multi-layer QLR with all WFS layers
 * @internal Exported for testing
 */
export function generateMultiLayerWfsQlr(
  layerInfo: OgcLayerInfo,
  layerNames: string[],
  crs: SupportedCrs
): string {
  const { title = 'WFS layers' } = layerInfo

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')

  // Add outer wrapper layer-tree-group with empty name
  const outerGroup = root.ele('layer-tree-group', {
    checked: 'Qt::Checked',
    groupLayer: '',
    expanded: '1',
    name: ''
  })
  outerGroup.ele('customproperties').ele('Option')

  // Add maplayers section
  const maplayers = root.ele('maplayers')

  // Use shared function to add dataset with all its layers
  const layers = layerNames.map((layerName) => ({
    ...layerInfo,
    layerName
  }))
  addDatasetLayers(
    outerGroup,
    title,
    layerInfo.title || title,
    layers,
    crs,
    maplayers
  )

  return root.end({ prettyPrint: true })
}

/**
 * Generates WMS datasource string for a layer
 */
function buildWmsDatasource(
  baseUrl: string,
  layerName: string,
  crs: SupportedCrs
): string {
  return [
    'contextualWMSLegend=0',
    `crs=${crs}`,
    'dpiMode=7',
    'featureCount=10',
    'format=image/png',
    `layers=${layerName}`,
    'styles',
    `url=${baseUrl}`
  ].join('&')
}

/**
 * Adds a dataset with its layers to a parent element.
 * Creates a nested group only when multiple layers exist.
 * This is the single source of truth for dataset structure in both single and multi-factor exports.
 *
 * @param parent - Parent XML element to add to
 * @param datasetTitle - Dataset title (used as layer name for single layer)
 * @param ogcServiceTitle - OGC service title (used as group name for multiple layers)
 * @param layers - Array of OGC layer info
 * @param crs - Coordinate reference system
 * @param maplayers - XML builder for maplayers section
 */
function addDatasetLayers(
  parent: XMLBuilder,
  datasetTitle: string,
  ogcServiceTitle: string,
  layers: OgcLayerInfo[],
  crs: SupportedCrs,
  maplayers: XMLBuilder
): void {
  // Create nested group only when multiple layers
  const needsGroup = layers.length > 1
  let targetElement = parent

  if (needsGroup) {
    // Create nested group - use OGC service title
    const group = parent.ele('layer-tree-group', {
      checked: 'Qt::Checked',
      groupLayer: '',
      expanded: '1',
      name: ogcServiceTitle
    })
    group.ele('customproperties').ele('Option')
    targetElement = group
  }

  // Add each layer
  layers.forEach((layerInfo) => {
    const { format, url, layerName = '' } = layerInfo
    const layerId = generateId()

    let datasource: string
    let provider: OGC_SERVICE_FORMAT
    let type: LAYER_TYPE
    let providerKey: string

    if (format === 'wfs') {
      const baseUrl = extractBaseUrl(url)
      datasource = buildWfsDatasource(baseUrl, layerName, crs)
      provider = 'wfs'
      type = 'vector'
      providerKey = 'WFS'
    } else if (format === 'wms') {
      const baseUrl = extractBaseUrl(url)
      datasource = buildWmsDatasource(baseUrl, layerName, crs)
      provider = 'wms'
      type = 'raster'
      providerKey = 'WMS'
    } else {
      return
    }

    // Display name: for multi-layer use layer name, for single use dataset title
    const displayName = needsGroup ? layerName : datasetTitle

    // Add to tree
    const layerTreeLayer = targetElement.ele('layer-tree-layer', {
      providerKey,
      source: datasource,
      id: layerId,
      name: displayName,
      expanded: '0',
      checked: 'Qt::Checked'
    })
    layerTreeLayer.ele('customproperties').ele('Option')

    // Add to maplayers
    addMaplayer(
      maplayers,
      layerId,
      datasource,
      provider,
      displayName,
      type,
      crs
    )
  })
}

/**
 * Generates a multi-dataset, multi-group QLR file for a topic
 * Organizes layers by factor groups with support for both WFS and WMS
 * @internal Exported for testing
 */
export function generateTopicQlr(
  topicTitle: string,
  layersByGroup: TopicLayersByGroup[],
  crs: SupportedCrs = DEFAULT_PROJECTION
): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')

  // Add outer wrapper layer-tree-group with empty name
  const outerGroup = root.ele('layer-tree-group', {
    checked: 'Qt::Checked',
    groupLayer: '',
    expanded: '1',
    name: ''
  })
  outerGroup.ele('customproperties').ele('Option')

  // Add topic-level layer-tree-group
  const topicGroup = outerGroup.ele('layer-tree-group', {
    checked: 'Qt::Checked',
    groupLayer: '',
    expanded: '1',
    name: topicTitle
  })
  topicGroup.ele('customproperties').ele('Option')

  // Add maplayers section (will be populated by addDatasetLayers)
  const maplayers = root.ele('maplayers')

  // Add each factor group
  layersByGroup.forEach((group) => {
    const factorGroup = topicGroup.ele('layer-tree-group', {
      checked: 'Qt::Checked',
      groupLayer: '',
      expanded: '1',
      name: group.groupName
    })
    factorGroup.ele('customproperties').ele('Option')

    // Group layers by datasetId and ogcLayerInfo.title to detect multi-layer datasets
    const layersByDataset = new Map<
      string,
      { layers: typeof group.layers; ogcTitle: string }
    >()
    group.layers.forEach((layer) => {
      const key = `${layer.datasetId}_${layer.ogcLayerInfo.title}`
      if (!layersByDataset.has(key)) {
        layersByDataset.set(key, {
          layers: [],
          ogcTitle: layer.ogcLayerInfo.title || layer.datasetTitle
        })
      }
      layersByDataset.get(key)!.layers.push(layer)
    })

    // Add each dataset (with potential sub-grouping for multi-layer datasets)
    layersByDataset.forEach(({ layers: datasetLayers, ogcTitle }) => {
      const datasetTitle = datasetLayers[0].datasetTitle
      addDatasetLayers(
        factorGroup,
        datasetTitle,
        ogcTitle,
        datasetLayers.map((l) => l.ogcLayerInfo),
        crs,
        maplayers
      )
    })
  })

  return root.end({ prettyPrint: true })
}

/**
 * Downloads a .qlr file with the given content
 */
function downloadQlrFile(
  content: string,
  filename: string = 'layer.qlr'
): void {
  const blob = new Blob([content], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoke URL after a short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Expands a WFS service without a layer name into multiple layers by fetching
 * all available layers from GetCapabilities.
 * For other formats or WFS with layer name, returns the original info as a single-element array.
 */
export async function expandWfsLayers(
  ogcInfo: OgcLayerInfo
): Promise<OgcLayerInfo[]> {
  if (ogcInfo.format === 'wfs' && !ogcInfo.layerName) {
    const baseUrl = extractBaseUrl(ogcInfo.url)
    const layerNames = await fetchWfsLayerNames(baseUrl)

    if (layerNames.length === 0) {
      return []
    }

    return layerNames.map((layerName) => ({
      ...ogcInfo,
      layerName
    }))
  }

  return [ogcInfo]
}

/**
 * Opens a QGIS-compatible resource by downloading a .qlr file
 */
export async function openInQgis(
  layerInfo: OgcLayerInfo,
  datasetTitle?: string,
  crs: SupportedCrs = DEFAULT_PROJECTION
): Promise<void> {
  let qlrContent: string

  // for wms, just generate a QLR with the metadata we have (layer name from resource title)
  if (layerInfo.format === 'wms') {
    qlrContent = generateWmsQlr(layerInfo, crs)
  }
  // wfs is more advanced, without a valid layer name we fallback on all layers
  else if (layerInfo.format === 'wfs') {
    if (!layerInfo.layerName) {
      console.info(
        'No layerName for WFS specified, fetching GetCapabilities...'
      )

      const expandedLayers = await expandWfsLayers(layerInfo)

      if (expandedLayers.length === 0) {
        const baseUrl = extractBaseUrl(layerInfo.url)
        alert(
          `Impossible de récupérer la liste des couches WFS.

Pour ajouter cette couche dans QGIS :
1. Ouvrez QGIS
2. Allez dans "Couche" > "Ajouter une couche" > "Ajouter une couche WFS"
3. Créez une nouvelle connexion avec l'URL : ${baseUrl}
4. Sélectionnez la couche désirée dans la liste`
        )
        return
      }

      // Generate a multi-layer QLR with all available layers
      console.info(
        `Found ${expandedLayers.length} WFS layers, generating multi-layer QLR`
      )
      const layerNames = expandedLayers
        .map((l) => l.layerName)
        .filter((n): n is string => !!n)
      qlrContent = generateMultiLayerWfsQlr(layerInfo, layerNames, crs)
    } else {
      qlrContent = generateWfsQlr(layerInfo, crs)
    }
  } else {
    console.warn(`Unsupported OGC service format: ${layerInfo.format}`)
    return
  }

  const filename = datasetTitle
    ? `${datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.qlr`
    : 'layer.qlr'

  downloadQlrFile(qlrContent, filename)
}

/**
 * Opens all OGC resources from a topic in QGIS
 * Downloads a single .qlr file with all layers organized by groups
 */
export function openTopicInQgis(
  layersByGroup: TopicLayersByGroup[],
  topicTitle: string,
  crs: SupportedCrs = DEFAULT_PROJECTION
): void {
  const qlrContent = generateTopicQlr(topicTitle, layersByGroup, crs)

  const filename = topicTitle
    ? `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_topic.qlr`
    : 'topic.qlr'

  downloadQlrFile(qlrContent, filename)
}
