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
  foundWfs: boolean
}

/**
 * Helper to parse XML string into a DOM Document
 */
export function parseXml(xmlString: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`XML parsing failed: ${parserError.textContent}`)
  }

  return doc
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
    const xmlDoc = parseXml(xmlText)

    // Extract layer names from FeatureTypeList
    const layerNames: string[] = []
    // Try different namespaces
    const nameElements = xmlDoc.querySelectorAll(
      'FeatureType > Name, ' + // WFS 1.0.0
        'wfs\\:FeatureType > wfs\\:Name, ' + // WFS 1.1.0 & 2.0.0
        'FeatureType > wfs\\:Name' // Defensive: non-standard implementations
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
 * Layer names should be technical identifiers: 1-100 chars, alphanumeric + _-.:
 */
export function isValidLayerName(layerName: string): boolean {
  // Combined check: length (1-100), no spaces, valid characters only
  const layerNamePattern = /^[a-zA-Z0-9_\-.:]{1,100}$/
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

  for (const resource of resources) {
    // Skip intranet URLs (not accessible outside government network)
    if (/\.rie\.gouv\.fr/i.test(resource.url)) {
      continue
    }

    // type assertion from OGC_SERVICES_FORMATS values array in datagouv components
    const format = detectOgcService(resource) as OGC_SERVICE_FORMAT
    if (format) {
      let layerName = undefined

      // Try to extract layer name from URL parameters or resource.title
      const extractedName = extractLayerNameFromUrl(resource.url, format)
      if (extractedName && isValidLayerName(extractedName)) {
        layerName = extractedName
      } else if (resource.title && isValidLayerName(resource.title)) {
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
