// maplibre-gl v6 resolves its worker via import.meta.url, which Vite can't bundle: ship it as an asset instead
import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)
