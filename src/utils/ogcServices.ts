import type { Resource } from '@/model/resource'
import { detectOgcService } from '@datagouv/components-next'

export type OGC_SERVICE_FORMAT = 'wms' | 'wfs'

/**
 * Information about an OGC service layer (WFS/WMS)
 */
export interface OgcLayerInfo {
  url: string
  format: OGC_SERVICE_FORMAT
  layerName?: string
  title?: string
}

export interface OgcSearchResult {
  layerInfo: OgcLayerInfo | null
  foundWfs: boolean // true if WFS found (best possible, no need to search more)
}

/**
 * Extracts base URL by removing GetCapabilities query parameters
 * WFS URLs often come as: https://example.com/wfs?request=GetCapabilities&service=WFS
 * This returns just the base URL: https://example.com/wfs
 */
export function extractBaseUrl(url: string): string {
  const urlObj = new URL(url)
  // Remove GetCapabilities-specific parameters
  urlObj.searchParams.delete('request')
  urlObj.searchParams.delete('service')
  return urlObj.toString()
}

/**
 * Fetches and parses WFS GetCapabilities to extract available layer names
 */
export async function fetchWfsLayerNames(baseUrl: string): Promise<string[]> {
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

/**
 * Validates if a string could be a valid OGC layer name (WMS/WFS)
 * Valid layer names typically:
 * - Contain only alphanumeric, underscore, hyphen, colon, and dot characters
 * - Don't contain spaces or special characters
 * - Are relatively short (not long sentences)
 * - May follow pattern: namespace:layername or just layername
 */
export function isValidLayerName(layerName: string): boolean {
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
export function extractLayerNameFromUrl(
  url: string,
  format: OGC_SERVICE_FORMAT
): string | null {
  try {
    const urlObj = new URL(url)

    // Define parameter names to check based on format
    const paramNames =
      format === 'wfs'
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
 * Finds the first OGC-compatible resource in a dataset
 * Prioritizes WFS over WMS (vector data is more useful than raster)
 * Excludes intranet URLs (*.rie.gouv.fr)
 * Returns result with foundWfs flag to signal if search can stop
 */
export function findOgcCompatibleResource(
  resources: Resource[]
): OgcSearchResult {
  let wmsCandidate: OgcLayerInfo | null = null

  // First pass: look for WFS
  for (const resource of resources) {
    // Skip intranet URLs (not accessible outside government network)
    if (/\.rie\.gouv\.fr/i.test(resource.url)) {
      continue
    }

    // type assertion from OGC_SERVICES_FORMATS values array in datagouv components
    const format = detectOgcService(resource) as OGC_SERVICE_FORMAT
    if (format) {
      let layerName = undefined

      // Try to extract layer name from URL parameters
      const extractedName = extractLayerNameFromUrl(resource.url, format)
      if (extractedName && isValidLayerName(extractedName)) {
        layerName = extractedName
      } else if (resource.title && isValidLayerName(resource.title)) {
        // Resource title might be a valid layer name
        layerName = resource.title
      }

      if (format === 'wfs') {
        // WFS found - return immediately (best result, no need to search more)
        return {
          layerInfo: {
            url: resource.url,
            format,
            title: resource.title,
            layerName
          },
          foundWfs: true
        }
      }
      // layerName is required for WMS (we don't do multi-layers)
      else if (format === 'wms' && layerName && !wmsCandidate) {
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

  // No WFS found, return WMS if available (or null)
  return {
    layerInfo: wmsCandidate,
    foundWfs: false
  }
}
