import { create } from 'xmlbuilder2'
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces'
import type { OGC_SERVICE_FORMAT, OgcLayerInfo } from './ogcServices'
import { extractBaseUrl, fetchWfsLayerNames } from './ogcServices'

/**
 * Datasets grouped by factor group name for topic export
 */
type DatasetsByGroup = Map<
  string,
  {
    ogcInfo: OgcLayerInfo
    datasetTitle: string
  }[]
>

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
 * Creates a layer-tree-group element with standard QGIS attributes
 */
function createGroup(parent: XMLBuilder, name: string): XMLBuilder {
  const group = parent.ele('layer-tree-group', {
    checked: 'Qt::Checked',
    groupLayer: '',
    expanded: '1',
    name
  })
  group.ele('customproperties').ele('Option')
  return group
}

/**
 * Creates the root of the QLR XML
 */
function createRoot() {
  return create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')
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
 * Always creates a consistent two-level group structure:
 * Dataset Title > Resource Title > Layers
 *
 * @param parent - Parent XML element to add to
 * @param datasetTitle - Dataset title (top-level group)
 * @param resourceTitle - Resource title (second-level group)
 * @param layers - Array of OGC layer info
 * @param crs - Coordinate reference system
 * @param maplayers - XML builder for maplayers section
 */
function addDatasetLayers(
  parent: XMLBuilder,
  datasetTitle: string,
  resourceTitle: string,
  layers: OgcLayerInfo[],
  crs: SupportedCrs,
  maplayers: XMLBuilder
): void {
  const datasetGroup = createGroup(parent, datasetTitle)
  const resourceGroup = createGroup(datasetGroup, resourceTitle)

  layers.forEach((layerInfo) => {
    const { format, url, layerName = '' } = layerInfo
    const layerId = generateId()
    const baseUrl = extractBaseUrl(url)

    let datasource: string
    let provider: OGC_SERVICE_FORMAT
    let type: LAYER_TYPE
    let providerKey: string

    if (format === 'wfs') {
      datasource = buildWfsDatasource(baseUrl, layerName, crs)
      provider = 'wfs'
      type = 'vector'
      providerKey = 'WFS'
    } else if (format === 'wms') {
      datasource = buildWmsDatasource(baseUrl, layerName, crs)
      provider = 'wms'
      type = 'raster'
      providerKey = 'WMS'
    } else {
      console.error(`Unsupported format '${format}'`)
      return
    }

    const layerTreeLayer = resourceGroup.ele('layer-tree-layer', {
      providerKey,
      source: datasource,
      id: layerId,
      name: layerName,
      expanded: '0',
      checked: 'Qt::Checked'
    })
    layerTreeLayer.ele('customproperties').ele('Option')

    addMaplayer(maplayers, layerId, datasource, provider, layerName, type, crs)
  })
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
 * Resolves OGC layer info to an array of concrete layers.
 * - WFS without layerName: fetches all layers from GetCapabilities and expands
 * - WFS with layerName: returns as-is in array
 * - WMS: returns as-is in array
 */
export async function resolveOgcLayers(
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
 * Generates QLR XML for a single dataset
 * @internal Exported for testing
 */
export function generateSingleDatasetQlr(
  datasetTitle: string,
  resourceTitle: string,
  layers: OgcLayerInfo[],
  crs: SupportedCrs = DEFAULT_PROJECTION
): string {
  const root = createRoot()
  const outerGroup = createGroup(root, '')
  const maplayers = root.ele('maplayers')

  addDatasetLayers(
    outerGroup,
    datasetTitle,
    resourceTitle,
    layers,
    crs,
    maplayers
  )

  return root.end({ prettyPrint: true })
}

/**
 * Opens a QGIS-compatible resource by downloading a .qlr file
 */
export async function openInQgis(
  layerInfo: OgcLayerInfo,
  datasetTitle: string,
  crs: SupportedCrs = DEFAULT_PROJECTION
): Promise<void> {
  // Resolve OGC layers (expand WFS if needed)
  const expandedLayers = await resolveOgcLayers(layerInfo)
  if (expandedLayers.length === 0) {
    // Show detailed error for single-dataset export
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

  const qlrContent = generateSingleDatasetQlr(
    datasetTitle,
    layerInfo.resourceTitle,
    expandedLayers,
    crs
  )
  const filename = `${datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.qlr`
  downloadQlrFile(qlrContent, filename)
}

/**
 * Prepared dataset data for topic QLR generation
 */
export interface PreparedDataset {
  datasetTitle: string
  layers: OgcLayerInfo[]
}

/**
 * Generates QLR XML for a topic with multiple datasets organized by factor groups
 * @internal Exported for testing
 *
 * Typical structure:
 * - Topic Name
 *   - Factor Group 1
 *     - Dataset 1
 *       - Resource 1
 *         - Layer 1
 *         - Layer 2
 *     - Dataset 2
 *       - Resource 2
 *         - Layer 3
 *   - Factor Group 2
 *     - Dataset 3
 *       - Resource 3
 *         - Layer 4
 */
export function generateTopicQlr(
  preparedByGroup: Map<string, PreparedDataset[]>,
  topicTitle: string,
  crs: SupportedCrs = DEFAULT_PROJECTION
): string {
  const root = createRoot()
  const outerGroup = createGroup(root, '')
  const topicGroup = createGroup(outerGroup, topicTitle)

  const maplayers = root.ele('maplayers')

  // Add each factor group
  preparedByGroup.forEach((preparedDatasets, groupName) => {
    const factorGroup = createGroup(topicGroup, groupName)

    // Add each dataset
    preparedDatasets.forEach(({ datasetTitle, layers }) => {
      // All layers share the same resource titles in a topic
      const resourceTitle = layers[0].resourceTitle
      addDatasetLayers(
        factorGroup,
        datasetTitle,
        resourceTitle,
        layers,
        crs,
        maplayers
      )
    })
  })

  return root.end({ prettyPrint: true })
}

/**
 * Opens all OGC resources from a topic in QGIS
 * Downloads a single .qlr file with all layers organized by groups
 */
export async function openTopicInQgis(
  datasetsByGroup: DatasetsByGroup,
  topicTitle: string,
  crs: SupportedCrs = DEFAULT_PROJECTION
): Promise<void> {
  const preparedByGroup = new Map<string, PreparedDataset[]>()

  for (const [groupName, datasets] of datasetsByGroup) {
    for (const { ogcInfo, datasetTitle } of datasets) {
      const expandedLayers = await resolveOgcLayers(ogcInfo)
      if (expandedLayers.length === 0) continue

      if (!preparedByGroup.has(groupName)) {
        preparedByGroup.set(groupName, [])
      }
      preparedByGroup.get(groupName)!.push({
        datasetTitle,
        layers: expandedLayers
      })
    }
  }

  if (preparedByGroup.size === 0) {
    console.warn('No OGC-compatible resources found in topic')
    return
  }

  const qlrContent = generateTopicQlr(preparedByGroup, topicTitle, crs)
  const filename = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_topic.qlr`
  downloadQlrFile(qlrContent, filename)
}
