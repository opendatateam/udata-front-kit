import type { Resource } from '@/model/resource'
import { detectOgcService } from '@datagouv/components-next'
import { useRandomId } from '@gouvminint/vue-dsfr'
import { create } from 'xmlbuilder2'

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
  return `layer_${useRandomId()}`
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content
 */
function generateQlr(
  layerInfo: QgisLayerInfo,
  type: 'raster' | 'vector',
  provider: string,
  datasource: string
): string {
  const { title = 'Layer' } = layerInfo

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .dtd({
      name: 'qgis-layer-definition'
    })
    .ele('qlr')
    .ele('layer-tree-layer')
    .att('name', title)
    .att('expanded', '1')
    .att('checked', 'Qt::Checked')
    .ele('customproperties')
    .up()
    .up()
    .ele('maplayers')
    .ele('maplayer')
    .att('type', type)
    .att('hasScaleBasedVisibilityFlag', '0')
    .ele('id')
    .txt(generateId())
    .up()
    .ele('datasource')
    .txt(datasource)
    .up()
    .ele('provider')
    .att('encoding', 'UTF-8')
    .txt(provider)
    .up()
    .ele('layername')
    .txt(title)
    .up()
    .up()
    .up()
    .up()

  return doc.end({ prettyPrint: true })
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content for WMS layers
 */
function generateWmsQlr(layerInfo: QgisLayerInfo): string {
  const { url, layerName = '' } = layerInfo

  const datasource = [
    'contextualWMSLegend=0',
    'crs=EPSG:4326',
    'dpiMode=7',
    'featureCount=10',
    'format=image/png',
    `layers=${layerName}`,
    'styles',
    `url=${url}`
  ].join('&')

  return generateQlr(layerInfo, 'raster', 'wms', datasource)
}

/**
 * Generates QGIS Layer Definition (.qlr) XML content for WFS layers
 */
function generateWfsQlr(layerInfo: QgisLayerInfo): string {
  const { url, layerName = '' } = layerInfo

  const datasource = [
    "pagingEnabled='true'",
    "preferCoordinatesForWfsT11='false'",
    "restrictToRequestBBOX='1'",
    "srsname='EPSG:4326'",
    `typename='${layerName}'`,
    `url='${url}'`,
    "version='auto'",
    'table=""'
  ].join(' ')

  return generateQlr(layerInfo, 'vector', 'WFS', datasource)
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
 * Finds the first OGC-compatible resource in a dataset and returns QGIS layer info
 */
export function findQgisCompatibleResource(
  resources: Resource[]
): QgisLayerInfo | null {
  for (const resource of resources) {
    const format = detectOgcService(resource)
    if (format) {
      return {
        url: resource.url,
        format,
        title: resource.title || 'Layer',
        // For WMS/WFS, the resource title typically contains the layer name
        layerName: resource.title || ''
      }
    }
  }
  return null
}

/**
 * Opens a QGIS-compatible resource by downloading a .qlr file
 */
export function openInQgis(
  layerInfo: QgisLayerInfo,
  datasetTitle?: string
): void {
  let qlrContent: string

  const format = layerInfo.format.toLowerCase()

  if (format === 'wms') {
    qlrContent = generateWmsQlr(layerInfo)
  } else if (format === 'wfs') {
    qlrContent = generateWfsQlr(layerInfo)
  } else {
    console.warn(`Unsupported OGC service format: ${format}`)
    return
  }

  const filename = datasetTitle
    ? `${datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.qlr`
    : 'layer.qlr'

  downloadQlrFile(qlrContent, filename)
}
