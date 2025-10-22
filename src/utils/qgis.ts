import type { Resource } from '@/model/resource'
import { detectOgcService } from '@datagouv/components-next'
import { create } from 'xmlbuilder2'
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces'

/**
 * Extracts base URL by removing GetCapabilities query parameters
 * WFS URLs often come as: https://example.com/wfs?request=GetCapabilities&service=WFS
 * This returns just the base URL: https://example.com/wfs
 */
function extractBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove GetCapabilities-specific parameters
    urlObj.searchParams.delete('request')
    urlObj.searchParams.delete('service')
    // If no other parameters remain, use just the base path
    if (urlObj.searchParams.toString() === '') {
      return `${urlObj.origin}${urlObj.pathname}`
    } else {
      return urlObj.toString()
    }
  } catch {
    // If URL parsing fails, use as-is
    return url
  }
}

/**
 * Fetches and parses WFS GetCapabilities to extract available layer names
 */
async function fetchWfsLayerNames(baseUrl: string): Promise<string[]> {
  try {
    // Build GetCapabilities URL
    const url = new URL(baseUrl)
    url.searchParams.set('service', 'WFS')
    url.searchParams.set('request', 'GetCapabilities')

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse GetCapabilities XML')
    }

    // Extract layer names from FeatureTypeList
    // WFS uses <FeatureType><Name>namespace:layername</Name></FeatureType>
    const layerNames: string[] = []

    // Try different namespaces (WFS 1.0.0, 1.1.0, 2.0.0)
    const nameElements = xmlDoc.querySelectorAll(
      'FeatureType > Name, ' +
        'wfs\\:FeatureType > wfs\\:Name, ' +
        'FeatureType > wfs\\:Name'
    )

    nameElements.forEach((element) => {
      const name = element.textContent?.trim()
      if (name) {
        layerNames.push(name)
      }
    })

    return layerNames
  } catch (error) {
    console.error('Failed to fetch WFS GetCapabilities:', error)
    return []
  }
}

export interface QgisLayerInfo {
  url: string
  format: string
  title?: string
  layerName?: string
}

/**
 * Generates a unique ID for QGIS layers
 */
function generateId(): string {
  return `layer_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`
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
  crs: string = 'EPSG:4326'
) {
  const maplayer = parent.ele('maplayer', {
    type: type,
    hasScaleBasedVisibilityFlag: '0'
  })

  maplayer.ele('id').txt(id)
  maplayer.ele('datasource').txt(datasource)
  maplayer.ele('provider', { encoding: 'UTF-8' }).txt(provider)
  maplayer.ele('layername').txt(layerName)

  // Add CRS for vector layers
  if (type === 'vector') {
    const spatialrefsys = maplayer.ele('srs').ele('spatialrefsys')
    spatialrefsys.ele('proj4').txt('+proj=longlat +datum=WGS84 +no_defs')
    spatialrefsys.ele('srid').txt('4326')
    spatialrefsys.ele('authid').txt(crs)
  }

  return maplayer
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content
 */
function generateQlr(
  layerInfo: QgisLayerInfo,
  type: 'raster' | 'vector',
  provider: string,
  datasource: string,
  crs: string = 'EPSG:4326'
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
 */
function generateWmsQlr(layerInfo: QgisLayerInfo): string {
  const { url, layerName = '' } = layerInfo

  // Clean URL for consistency with WFS
  const baseUrl = extractBaseUrl(url)

  const datasource = [
    'contextualWMSLegend=0',
    'crs=EPSG:4326',
    'dpiMode=7',
    'featureCount=10',
    'format=image/png',
    `layers=${layerName}`,
    'styles',
    `url=${baseUrl}`
  ].join('&')

  return generateQlr(layerInfo, 'raster', 'wms', datasource)
}

/**
 * Builds WFS datasource string
 */
function buildWfsDatasource(baseUrl: string, typename: string): string {
  const params = [
    "pagingEnabled='true'",
    "preferCoordinatesForWfsT11='false'",
    "restrictToRequestBBOX='1'",
    "srsname='EPSG:4326'",
    `typename='${typename}'`,
    `url='${baseUrl}'`,
    "version='auto'",
    'table=""'
  ]
  return params.join(' ')
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content for WFS layers
 */
function generateWfsQlr(layerInfo: QgisLayerInfo): string {
  const { url, layerName = '' } = layerInfo
  const baseUrl = extractBaseUrl(url)
  const datasource = buildWfsDatasource(baseUrl, layerName)

  return generateQlr(layerInfo, 'vector', 'WFS', datasource)
}

/**
 * Generates a multi-layer QLR with all WFS layers
 */
function generateMultiLayerWfsQlr(
  layerInfo: QgisLayerInfo,
  layerNames: string[]
): string {
  const { url, title = 'WFS Layers' } = layerInfo
  const baseUrl = extractBaseUrl(url)

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')

  // Add layer-tree-group for multiple layers
  const layerTree = root.ele('layer-tree-group', {
    name: title,
    expanded: '1',
    checked: 'Qt::Checked'
  })

  // Generate layer IDs once and reuse them
  const layerIds = layerNames.map(
    (layerName, index) =>
      `layer_${layerName.replace(/:/g, '_')}_${Date.now()}_${index}`
  )

  // Add each layer as a child in the tree
  layerNames.forEach((layerName, index) => {
    layerTree.ele('layer-tree-layer', {
      id: layerIds[index],
      name: layerName,
      expanded: '0',
      checked: 'Qt::Checked'
    })
  })

  // Add all maplayers
  const maplayers = root.ele('maplayers')

  layerNames.forEach((layerName, index) => {
    const datasource = buildWfsDatasource(baseUrl, layerName)
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
 * Validates if a string could be a valid OGC layer name (WMS/WFS)
 * Valid layer names typically:
 * - Contain only alphanumeric, underscore, hyphen, colon, and dot characters
 * - Don't contain spaces or special characters
 * - Are relatively short (not long sentences)
 * - May follow pattern: namespace:layername or just layername
 */
function isValidLayerName(layerName: string): boolean {
  if (!layerName || layerName.length === 0) {
    return false
  }

  // Check if it's too long (likely a human-readable title if > 100 chars)
  if (layerName.length > 100) {
    return false
  }

  // Check if it contains spaces (layer names shouldn't have spaces)
  if (layerName.includes(' ')) {
    return false
  }

  // Check if it matches typical layer name pattern
  // Allows: alphanumeric, underscore, hyphen, colon (for namespace), and dot
  const layerNamePattern = /^[a-zA-Z0-9_\-.:]+$/
  return layerNamePattern.test(layerName)
}

/**
 * Extracts the layer name from URL query parameters
 * Works for both WMS (layers=) and WFS (typename=)
 */
function extractLayerNameFromUrl(url: string, format: string): string | null {
  try {
    const urlObj = new URL(url)

    // Define parameter names to check based on format
    const paramNames =
      format.toLowerCase() === 'wfs'
        ? ['typename', 'typeName', 'typeNames']
        : ['layers', 'layer']

    // Check all case variations of each parameter name
    for (const paramName of paramNames) {
      const value =
        urlObj.searchParams.get(paramName) ||
        urlObj.searchParams.get(paramName.toUpperCase())
      if (value) {
        return value
      }
    }
  } catch {
    // If URL parsing fails, return null
  }
  return null
}

/**
 * Finds the first OGC-compatible resource in a dataset and returns QGIS layer info
 * Prioritizes WFS over WMS (vector data is more useful than raster)
 */
export function findQgisCompatibleResource(
  resources: Resource[]
): QgisLayerInfo | null {
  let wmsCandidate: QgisLayerInfo | null = null

  // First pass: look for WFS
  for (const resource of resources) {
    const format = detectOgcService(resource)
    if (format) {
      let layerName = ''

      // Try to extract layer name from URL parameters
      const extractedName = extractLayerNameFromUrl(resource.url, format)
      if (extractedName && isValidLayerName(extractedName)) {
        layerName = extractedName
      } else if (resource.title && isValidLayerName(resource.title)) {
        // Resource title might be a valid layer name
        layerName = resource.title
      }

      if (format.toLowerCase() === 'wfs') {
        // WFS found - return immediately (or store it even without layer name)
        return {
          url: resource.url,
          format,
          title: resource.title,
          layerName
        }
      } else if (format.toLowerCase() === 'wms' && layerName && !wmsCandidate) {
        // Store first valid WMS as fallback
        wmsCandidate = {
          url: resource.url,
          format,
          title: resource.title,
          layerName
        }
      }
    }
  }

  // No WFS found, return WMS if available
  return wmsCandidate
}

/**
 * Opens a QGIS-compatible resource by downloading a .qlr file
 */
export async function openInQgis(
  layerInfo: QgisLayerInfo,
  datasetTitle?: string
): Promise<void> {
  let qlrContent: string

  const format = layerInfo.format.toLowerCase()

  if (format === 'wms') {
    qlrContent = generateWmsQlr(layerInfo)
  } else if (format === 'wfs') {
    // If no typename is available, try to fetch it from GetCapabilities
    if (!layerInfo.layerName) {
      console.info('No WFS typename found, fetching GetCapabilities...')

      const baseUrl = extractBaseUrl(layerInfo.url)
      const layerNames = await fetchWfsLayerNames(baseUrl)

      if (layerNames.length === 0) {
        alert(
          'Impossible de récupérer la liste des couches WFS.\n\n' +
            'Pour ajouter cette couche dans QGIS :\n' +
            '1. Ouvrez QGIS\n' +
            '2. Allez dans "Couche" > "Ajouter une couche" > "Ajouter une couche WFS"\n' +
            `3. Créez une nouvelle connexion avec l\'URL : ${baseUrl}\n` +
            '4. Sélectionnez la couche désirée dans la liste'
        )
        return
      }

      // Generate a multi-layer QLR with all available layers
      console.info(
        `Found ${layerNames.length} WFS layers, generating multi-layer QLR`
      )
      qlrContent = generateMultiLayerWfsQlr(layerInfo, layerNames)
    } else {
      qlrContent = generateWfsQlr(layerInfo)
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
