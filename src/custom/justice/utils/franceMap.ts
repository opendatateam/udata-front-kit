import {
  Map as MapLibreMap,
  Popup,
  type MapGeoJSONFeature,
  type StyleSpecification
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/custom/justice/utils/franceMap.css'

import '@/utils/maplibreWorker'

const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://openmaptiles.data.gouv.fr/fonts/{fontstack}/{range}.pbf',
  sources: {
    'ign-tiles': {
      type: 'raster',
      tiles: [
        'https://data.geopf.fr/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}'
      ],
      tileSize: 256,
      attribution: '© IGN - Géoplateforme'
    }
  },
  layers: [
    {
      id: 'ign-layer',
      type: 'raster',
      source: 'ign-tiles',
      minzoom: 0,
      maxzoom: 18
    }
  ]
}

const LOCALE = {
  'CooperativeGesturesHandler.WindowsHelpText':
    'Utilisez Ctrl + molette pour zoomer la carte.',
  'CooperativeGesturesHandler.MacHelpText':
    'Utilisez ⌘ + molette pour zoomer la carte.',
  'CooperativeGesturesHandler.MobileHelpText':
    'Utilisez deux doigts pour déplacer la carte.'
}

export function mountFranceMap(container: HTMLElement) {
  const map = new MapLibreMap({
    container,
    style: MAP_STYLE,
    center: [2.5, 46.6],
    zoom: 5,
    cooperativeGestures: true,
    dragRotate: false,
    pitchWithRotate: false,
    attributionControl: { compact: true },
    locale: LOCALE
  })
  const popup = new Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12
  })
  const resizeObserver = new ResizeObserver(() => map.resize())
  resizeObserver.observe(container)

  function destroy() {
    resizeObserver.disconnect()
    popup.remove()
    map.remove()
  }

  return { map, popup, destroy }
}

export type FranceMap = ReturnType<typeof mountFranceMap>

// first line in bold, following lines as plain text
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

// sets the `hover` feature-state and shows a popup for the feature under the cursor; returns a reset function
export function bindHoverPopup(
  { map, popup }: FranceMap,
  source: string,
  layer: string,
  content: (feature: MapGeoJSONFeature) => HTMLElement
): () => void {
  let hoveredId: string | number | null = null

  function clearHover() {
    if (hoveredId != null) {
      map.setFeatureState({ source, id: hoveredId }, { hover: false })
    }
    hoveredId = null
    popup.remove()
    map.getCanvas().style.cursor = ''
  }

  map.on('mousemove', layer, (event) => {
    const feature = event.features?.[0]
    if (!feature) return
    if (hoveredId !== feature.id) {
      clearHover()
      hoveredId = feature.id ?? null
      if (hoveredId != null) {
        map.setFeatureState({ source, id: hoveredId }, { hover: true })
      }
    }
    map.getCanvas().style.cursor = 'pointer'
    popup.setLngLat(event.lngLat).setDOMContent(content(feature)).addTo(map)
  })
  map.on('mouseleave', layer, clearHover)

  return clearHover
}
