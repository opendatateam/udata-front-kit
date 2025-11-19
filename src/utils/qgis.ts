import { create } from 'xmlbuilder2'
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces'
import type { OgcLayerInfo } from './ogcServices'
import { extractBaseUrl, fetchWfsLayerNames } from './ogcServices'

const DEFAULT_PROJECTION = 'EPSG:4326'

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
  provider: string,
  layerName: string,
  type: 'raster' | 'vector',
  crs: string = DEFAULT_PROJECTION
) {
  const maplayer = parent.ele('maplayer', {
    type: type,
    hasScaleBasedVisibilityFlag: '0'
  })

  maplayer.ele('id').txt(id)
  maplayer.ele('datasource').txt(datasource)
  maplayer.ele('provider', { encoding: 'UTF-8' }).txt(provider)
  maplayer.ele('layername').txt(layerName)

  // Add CRS for all layers (both raster and vector need spatial reference)
  const spatialrefsys = maplayer.ele('srs').ele('spatialrefsys')
  spatialrefsys.ele('proj4').txt('+proj=longlat +datum=WGS84 +no_defs')
  spatialrefsys.ele('srid').txt('4326')
  spatialrefsys.ele('authid').txt(crs)

  return maplayer
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content
 */
function generateQlr(
  layerInfo: OgcLayerInfo,
  type: 'raster' | 'vector',
  provider: string,
  datasource: string,
  crs: string
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
export function generateWmsQlr(layerInfo: OgcLayerInfo, crs: string): string {
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
  crs: string
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
export function generateWfsQlr(layerInfo: OgcLayerInfo, crs: string): string {
  const { url, layerName = '' } = layerInfo
  const baseUrl = extractBaseUrl(url)
  const datasource = buildWfsDatasource(baseUrl, layerName, crs)

  return generateQlr(layerInfo, 'vector', 'WFS', datasource, crs)
}

/**
 * Generates a multi-layer QLR with all WFS layers
 * @internal Exported for testing
 */
export function generateMultiLayerWfsQlr(
  layerInfo: OgcLayerInfo,
  layerNames: string[],
  crs: string
): string {
  const { url, title = 'WFS Layers' } = layerInfo
  const baseUrl = extractBaseUrl(url)

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

  // Add inner layer-tree-group for the actual group
  const innerGroup = outerGroup.ele('layer-tree-group', {
    checked: 'Qt::Checked',
    groupLayer: '',
    expanded: '1',
    name: title
  })
  innerGroup.ele('customproperties').ele('Option')

  // Generate layer IDs once and reuse them
  const layerIds = layerNames.map(
    (layerName, index) =>
      `layer_${layerName.replace(/:/g, '_')}_${Date.now()}_${index}`
  )

  // Add each layer as a child in the tree with providerKey and source
  layerNames.forEach((layerName, index) => {
    const datasource = buildWfsDatasource(baseUrl, layerName, crs)
    const layerTreeLayer = innerGroup.ele('layer-tree-layer', {
      providerKey: 'WFS',
      source: datasource,
      id: layerIds[index],
      name: layerName,
      expanded: '0',
      checked: 'Qt::Checked'
    })
    layerTreeLayer.ele('customproperties').ele('Option')
  })

  // Add all maplayers
  const maplayers = root.ele('maplayers')

  layerNames.forEach((layerName, index) => {
    const datasource = buildWfsDatasource(baseUrl, layerName, crs)
    addMaplayer(
      maplayers,
      layerIds[index],
      datasource,
      'WFS',
      layerName,
      'vector'
    )
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
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Opens a QGIS-compatible resource by downloading a .qlr file
 */
export async function openInQgis(
  layerInfo: OgcLayerInfo,
  datasetTitle?: string,
  crs: string = DEFAULT_PROJECTION
): Promise<void> {
  let qlrContent: string

  const format = layerInfo.format.toLowerCase()

  // for wms, just generate a QLR with the metadata we have (layer name from resource title)
  if (format === 'wms') {
    qlrContent = generateWmsQlr(layerInfo, crs)
  }
  // wfs is more advanced, without a valid layer name we fallback on all layers
  else if (format === 'wfs') {
    // If no layerName is available, try to fetch it from GetCapabilities
    // TODO: maybe should we validate the layerName from getCap in all cases
    if (!layerInfo.layerName) {
      console.info(
        'No layerName for WFS specified, fetching GetCapabilities...'
      )

      const baseUrl = extractBaseUrl(layerInfo.url)
      const layerNames = await fetchWfsLayerNames(baseUrl)

      if (layerNames.length === 0) {
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
        `Found ${layerNames.length} WFS layers, generating multi-layer QLR`
      )
      qlrContent = generateMultiLayerWfsQlr(layerInfo, layerNames, crs)
    } else {
      qlrContent = generateWfsQlr(layerInfo, crs)
    }
  } else {
    console.warn(`Unsupported OGC service format: ${format}`)
    return
  }

  const filename = datasetTitle
    ? `${datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.qlr`
    : 'layer.qlr'

  downloadQlrFile(qlrContent, filename)
}
