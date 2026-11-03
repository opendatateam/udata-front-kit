import { Map as MapLibreMap, Popup, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/custom/justice/utils/maplibreWorker'

export const MAP_STYLE: StyleSpecification = {
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
