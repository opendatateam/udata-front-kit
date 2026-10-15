import type { Feature, MultiPolygon, Polygon } from 'geojson'

import config from '@/config'

export type MapGeometry = Polygon | MultiPolygon

export type MapFeature = Feature<
  MapGeometry,
  Record<string, string | number | null>
>

type LngLatBounds = [[number, number], [number, number]]

export async function fetchResourceGeoJson(
  resourceId: string
): Promise<MapFeature[]> {
  const metaUrl = `${config.datagouvfr.base_url}/api/2/datasets/resources/${resourceId}/`
  const metaResponse = await fetch(metaUrl)
  if (!metaResponse.ok) throw new Error(`Resource API ${metaResponse.status}`)
  const meta = (await metaResponse.json()) as { resource?: { url?: string } }
  const fileUrl = meta.resource?.url
  if (!fileUrl) throw new Error('GeoJSON URL missing')
  const fileResponse = await fetch(fileUrl)
  if (!fileResponse.ok) throw new Error(`GeoJSON ${fileResponse.status}`)
  const collection = (await fileResponse.json()) as {
    features: Array<{
      id?: string | number
      properties?: Record<string, string | number | null>
      geometry: MapGeometry
    }>
  }
  return collection.features.map((feature) => ({
    type: 'Feature',
    id: feature.id == null ? undefined : String(feature.id),
    properties: feature.properties ?? {},
    geometry: feature.geometry
  }))
}

export function boundsOf(
  features: Array<{ geometry: MapGeometry }>
): LngLatBounds | null {
  let minLon = 180
  let minLat = 90
  let maxLon = -180
  let maxLat = -90
  let found = false
  const visit = (coords: unknown) => {
    if (!Array.isArray(coords)) return
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      found = true
      minLon = Math.min(minLon, coords[0])
      minLat = Math.min(minLat, coords[1])
      maxLon = Math.max(maxLon, coords[0])
      maxLat = Math.max(maxLat, coords[1])
      return
    }
    for (const child of coords) visit(child)
  }
  for (const feature of features) visit(feature.geometry.coordinates)
  if (!found) return null
  return [
    [minLon, minLat],
    [maxLon, maxLat]
  ]
}

export function metroBounds(
  features: Array<{ geometry: MapGeometry }>
): LngLatBounds | null {
  let minLon = 180
  let minLat = 90
  let maxLon = -180
  let maxLat = -90
  let found = false
  const visit = (coords: unknown) => {
    if (!Array.isArray(coords)) return
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lon = coords[0]
      const lat = coords[1]
      if (lon < -12 || lon > 15 || lat < 40 || lat > 52) return
      found = true
      minLon = Math.min(minLon, lon)
      minLat = Math.min(minLat, lat)
      maxLon = Math.max(maxLon, lon)
      maxLat = Math.max(maxLat, lat)
      return
    }
    for (const child of coords) visit(child)
  }
  for (const feature of features) visit(feature.geometry.coordinates)
  if (!found) return null
  return [
    [minLon, minLat],
    [maxLon, maxLat]
  ]
}

export function popupLines(lines: string[]): HTMLElement {
  const wrapper = document.createElement('div')
  lines.forEach((line, index) => {
    const element =
      index === 0
        ? document.createElement('strong')
        : document.createElement('div')
    element.textContent = line
    wrapper.append(element)
  })
  return wrapper
}
